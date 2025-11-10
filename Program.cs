using DJDiP.Infrastructure.Persistance;
using DJDiP.Application.Interfaces;
using DJDiP.Application.Services;
using DJDiP.Application.DTO.EventDTO;
using DJDiP.Application.DTO.DJProfileDTO;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ========== DATABASE ==========
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ========== REGISTER UNIT OF WORK ==========
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ========== REGISTER SERVICES ==========
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IDJService, DJService>();

// ========== GRAPHQL ==========
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .ModifyOptions(o => o.StrictValidation = false);

var app = builder.Build();

// ========== DATABASE INITIALIZATION ==========
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        await DbInitializer.InitializeAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// ========== MIDDLEWARE ==========
app.UseCors("Frontend");

// ========== ROUTES ==========
app.MapGet("/", () => "DJ-DiP API is running! Visit /graphql for GraphQL playground.");

// GraphQL endpoint
app.MapGraphQL("/graphql");

app.Run();

public class Query
{
    // Landing page: upcoming events and featured DJs
    public async Task<LandingPageData> Landing(
        [Service] IEventService events,
        [Service] IDJService djs)
    {
        var upcoming = await events.GetAllAsync();
        var djList = await djs.GetAllAsync();
        return new LandingPageData
        {
            Events = upcoming,
            DJs = djList
        };
    }

    // All events
    public async Task<IEnumerable<EventListDto>> Events(
        [Service] IEventService events)
    {
        return await events.GetAllAsync();
    }

    // All DJs (FIXED: dJs not djs)
    public async Task<IEnumerable<DJProfileListItemDto>> DJs(
        [Service] IDJService djs)
    {
        return await djs.GetAllAsync();
    }

    // DJ profile by id
    public async Task<object?> Dj(
        Guid id,
        [Service] IDJService djs)
    {
        return await djs.GetByIdAsync(id);
    }
}

public class LandingPageData
{
    public IEnumerable<EventListDto> Events { get; set; } = new List<EventListDto>();
    public IEnumerable<DJProfileListItemDto> DJs { get; set; } = new List<DJProfileListItemDto>();
}
