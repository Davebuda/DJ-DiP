using DJDiP.Infrastructure.Persistance;
using DJDiP.Application.Interfaces;
using DJDiP.Application.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IDJService, DJService>();

// GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

// GraphQL endpoint
app.MapGraphQL("/graphql");

app.Run();

public class Query
{
    // Landing page: upcoming events and featured DJs
    public async Task<object> Landing(
        [Service] IEventService events,
        [Service] IDJService djs)
    {
        var upcoming = await events.GetAllAsync();
        var djList = await djs.GetAllAsync();
        return new { events = upcoming, djs = djList };
    }

    // DJ profile by id
    public Task<DJDiP.Application.DTO.DJProfileDTO.DJProfileDetailDto?> DjProfile(
        Guid id,
        [Service] IDJService djs) => djs.GetByIdAsync(id);
}
