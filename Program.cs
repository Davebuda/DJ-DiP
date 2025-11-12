using System.Text;
using DJDiP.Application.DTO.DJProfileDTO;
using DJDiP.Application.DTO.EventDTO;
using DJDiP.Application.DTO.GenreDTO;
using DJDiP.Application.DTO.NewsLetterDTO;
using DJDiP.Application.DTO.VenueDTO;
using DJDiP.Application.DTO.ContactMessageDTO;
using DJDiP.Application.DTO.DJTop10DTO;
using DJDiP.Application.DTO.TicketDTO;
using DJDiP.Application.DTO.SongDTO;
using DJDiP.Application.DTO.SiteSettingsDTO;
using DJDiP.Application.DTO.Auth;
using DJDiP.Application.Interfaces;
using DJDiP.Application.Services;
using DJDiP.Application.Options;
using DJDiP.Infrastructure.Persistance;
using HotChocolate;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VenueDetailsDto = DJDiP.Application.DTO.VenueDTO.VenueDto;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Jwt"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? string.Empty))
    };
});

builder.Services.AddAuthorization();

// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
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
builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<IVenueService, VenueService>();
builder.Services.AddScoped<IContactMessageService, ContactMessageService>();
builder.Services.AddScoped<INewsletterService, NewsletterService>();
builder.Services.AddScoped<IDJTop10Service, DJTop10Service>();
builder.Services.AddScoped<IFollowService, FollowService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<ISiteSettingsService, SiteSettingsService>();

// ========== GRAPHQL ==========
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
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
app.UseAuthentication();
app.UseAuthorization();

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

    // Event details by id
    public async Task<DetailEventDto?> Event(
        Guid id,
        [Service] IEventService events)
    {
        return await events.GetByIdAsync(id);
    }

    // All DJs (FIXED: dJs not djs)
    public async Task<IEnumerable<DJProfileListItemDto>> DJs(
        [Service] IDJService djs)
    {
        return await djs.GetAllAsync();
    }

    // DJ profile by id
    public async Task<DJProfileDetailDto?> Dj(
        Guid id,
        [Service] IDJService djs)
    {
        return await djs.GetByIdAsync(id);
    }

    // Follow stats helpers
    public async Task<IEnumerable<DJProfileListItemDto>> FollowedDjs(
        string userId,
        [Service] IFollowService followService)
    {
        return await followService.GetFollowedDjsAsync(userId);
    }

    public async Task<int> FollowerCount(
        Guid djId,
        [Service] IFollowService followService)
    {
        return await followService.GetFollowerCountAsync(djId);
    }

    public async Task<bool> IsFollowingDj(
        Guid djId,
        string userId,
        [Service] IFollowService followService)
    {
        return await followService.IsFollowingAsync(userId, djId);
    }

    // Tickets
    public async Task<IEnumerable<TicketDto>> TicketsByUser(
        string userId,
        [Service] ITicketService ticketService)
    {
        return await ticketService.GetTicketsByUserIdAsync(userId);
    }

    public async Task<IEnumerable<TicketDto>> TicketsByEvent(
        Guid eventId,
        [Service] ITicketService ticketService)
    {
        return await ticketService.GetTicketsByEventIdAsync(eventId);
    }

    public async Task<TicketDto?> Ticket(
        Guid id,
        [Service] ITicketService ticketService)
    {
        return await ticketService.GetTicketByIdAsync(id);
    }

    // Genres
    public async Task<IEnumerable<GenreDto>> Genres(
        [Service] IGenreService genres)
    {
        return await genres.GetAllAsync();
    }

    // Venues
    public async Task<IEnumerable<VenueDetailsDto>> Venues(
        [Service] IVenueService venues)
    {
        return await venues.GetAllAsync();
    }

    // Venue by id
    public async Task<VenueDetailsDto?> Venue(
        Guid id,
        [Service] IVenueService venues)
    {
        return await venues.GetByIdAsync(id);
    }

    // Contact messages
    public async Task<IEnumerable<ContactMessageReadDto>> ContactMessages(
        [Service] IContactMessageService contactMessageService)
    {
        return await contactMessageService.GetAllAsync();
    }

    // Newsletter subscriptions
    public async Task<IEnumerable<NewsletterDto>> Newsletters(
        [Service] INewsletterService newsletterService)
    {
        return await newsletterService.GetAllAsync();
    }

    // DJ Top 10 lists
    public async Task<IEnumerable<DJTop10ListDto>> DjTop10Lists(
        [Service] IDJTop10Service djTop10Service)
    {
        return await djTop10Service.GetAllAsync();
    }

    // DJ Top 10 entry
    public async Task<DJTop10ReadDto?> DjTop10(
        Guid id,
        [Service] IDJTop10Service djTop10Service)
    {
        return await djTop10Service.GetByIdAsync(id);
    }

    // Songs
    public async Task<IEnumerable<SongDto>> Songs(
        [Service] ISongService songService)
    {
        return await songService.GetAllSongsAsync();
    }

    public async Task<SongDto?> Song(
        Guid id,
        [Service] ISongService songService)
    {
        return await songService.GetSongByIdAsync(id);
    }

    // Site settings
    public async Task<SiteSettingsDto> SiteSettings(
        [Service] ISiteSettingsService siteSettingsService)
    {
        return await siteSettingsService.GetAsync();
    }
}

public class LandingPageData
{
    public IEnumerable<EventListDto> Events { get; set; } = new List<EventListDto>();
    public IEnumerable<DJProfileListItemDto> DJs { get; set; } = new List<DJProfileListItemDto>();
}

public class Mutation
{
    // AUTH MUTATIONS
    public async Task<AuthPayload> Register(
        RegisterInput input,
        [Service] IAuthService authService)
    {
        try
        {
            return await authService.RegisterAsync(input.FullName, input.Email, input.Password);
        }
        catch (InvalidOperationException ex)
        {
            throw new GraphQLException(ex.Message);
        }
    }

    public async Task<AuthPayload> Login(
        LoginInput input,
        [Service] IAuthService authService)
    {
        try
        {
            return await authService.LoginAsync(input.Email, input.Password);
        }
        catch (InvalidOperationException ex)
        {
            throw new GraphQLException(ex.Message);
        }
    }

    // EVENT MUTATIONS
    public async Task<Guid> CreateEvent(
        CreateEventInput input,
        [Service] IEventService events)
    {
        var dto = new CreateEventDto
        {
            Title = input.Title,
            Date = input.Date,
            VenueId = input.VenueId,
            Price = input.Price,
            Description = input.Description,
            GenreIds = input.GenreIds ?? new List<Guid>(),
            DJIds = input.DjIds ?? new List<Guid>(),
            ImageUrl = input.ImageUrl,
            VideoUrl = input.VideoUrl
        };

        return await events.CreateAsync(dto);
    }

    public async Task<bool> UpdateEvent(
        Guid id,
        UpdateEventInput input,
        [Service] IEventService events)
    {
        var dto = new UpdateEventDto
        {
            Id = id,
            Title = input.Title,
            Date = input.Date,
            VenueId = input.VenueId,
            Price = input.Price,
            Description = input.Description,
            GenreIds = input.GenreIds ?? new List<Guid>(),
            DJIds = input.DjIds ?? new List<Guid>(),
            ImageUrl = input.ImageUrl,
            VideoUrl = input.VideoUrl
        };

        await events.UpdateAsync(id, dto);
        return true;
    }

    public async Task<bool> DeleteEvent(
        Guid id,
        [Service] IEventService events)
    {
        await events.DeleteAsync(id);
        return true;
    }

    // DJ MUTATIONS
    public async Task<Guid> CreateDj(
        CreateDjInput input,
        [Service] IDJService djs)
    {
        var dto = new CreateDJProfileDto
        {
            StageName = input.StageName,
            FullName = input.FullName,
            Email = input.Email,
            Bio = input.Bio,
            LongBio = input.LongBio,
            Tagline = input.Tagline,
            Genre = input.Genre,
            SocialLinks = input.SocialLinks,
            ProfilePictureUrl = input.ProfilePictureUrl,
            CoverImageUrl = input.CoverImageUrl,
            Specialties = input.Specialties,
            Achievements = input.Achievements,
            YearsExperience = input.YearsExperience,
            InfluencedBy = input.InfluencedBy,
            EquipmentUsed = input.EquipmentUsed,
            UserId = input.UserId,
            TopTracks = input.TopTracks
        };

        return await djs.CreateAsync(dto);
    }

    public async Task<bool> UpdateDj(
        Guid id,
        UpdateDjInput input,
        [Service] IDJService djs)
    {
        var dto = new UpdateDJProfileDto
        {
            Id = id,
            StageName = input.StageName,
            FullName = input.FullName,
            Bio = input.Bio,
            LongBio = input.LongBio,
            Tagline = input.Tagline,
            Genre = input.Genre,
            SocialLinks = input.SocialLinks,
            ProfilePictureUrl = input.ProfilePictureUrl,
            CoverImageUrl = input.CoverImageUrl,
            Specialties = input.Specialties,
            Achievements = input.Achievements,
            YearsExperience = input.YearsExperience,
            InfluencedBy = input.InfluencedBy,
            EquipmentUsed = input.EquipmentUsed,
            TopTracks = input.TopTracks
        };

        await djs.UpdateAsync(id, dto);
        return true;
    }

    public async Task<bool> DeleteDj(
        Guid id,
        [Service] IDJService djs)
    {
        await djs.DeleteAsync(id);
        return true;
    }

    // GENRE MUTATIONS
    public async Task<Guid> CreateGenre(
        CreateGenreInput input,
        [Service] IGenreService genres)
    {
        var dto = new CreateGenreDto { Name = input.Name };
        return await genres.CreateAsync(dto);
    }

    public async Task<bool> UpdateGenre(
        Guid id,
        UpdateGenreInput input,
        [Service] IGenreService genres)
    {
        await genres.UpdateAsync(id, new UpdateGenreDto { Name = input.Name });
        return true;
    }

    // VENUE MUTATIONS
    public async Task<Guid> CreateVenue(
        CreateVenueInput input,
        [Service] IVenueService venues)
    {
        var dto = new CreateVenueDto
        {
            Name = input.Name,
            Description = input.Description,
            Address = input.Address,
            City = input.City,
            Country = input.Country,
            Latitude = input.Latitude,
            Longitude = input.Longitude,
            Capacity = input.Capacity,
            ContactEmail = input.ContactEmail,
            PhoneNumber = input.PhoneNumber,
            ImageUrl = input.ImageUrl
        };

        return await venues.CreateAsync(dto);
    }

    public async Task<bool> UpdateVenue(
        Guid id,
        UpdateVenueInput input,
        [Service] IVenueService venues)
    {
        var dto = new UpdateVenueDto
        {
            Id = id,
            Name = input.Name,
            Description = input.Description,
            Address = input.Address,
            City = input.City,
            Country = input.Country,
            Latitude = input.Latitude,
            Longitude = input.Longitude,
            Capacity = input.Capacity,
            ContactEmail = input.ContactEmail,
            PhoneNumber = input.PhoneNumber,
            ImageUrl = input.ImageUrl
        };

        await venues.UpdateAsync(id, dto);
        return true;
    }

    public async Task<bool> DeleteVenue(
        Guid id,
        [Service] IVenueService venues)
    {
        await venues.DeleteAsync(id);
        return true;
    }

    // CONTACT MESSAGE MUTATIONS
    public async Task<Guid> CreateContactMessage(
        CreateContactMessageInput input,
        [Service] IContactMessageService contactMessages)
    {
        var dto = new ContactMessageCreateDto
        {
            Message = input.Message,
            UserId = input.UserId
        };

        return await contactMessages.CreateAsync(dto);
    }

    public async Task<bool> DeleteContactMessage(
        Guid id,
        [Service] IContactMessageService contactMessages)
    {
        await contactMessages.DeleteAsync(id);
        return true;
    }

    // NEWSLETTER MUTATIONS
    public async Task<NewsletterDto> SubscribeNewsletter(
        CreateNewsletterInput input,
        [Service] INewsletterService newsletters)
    {
        var dto = new CreateNewsletterDto
        {
            Email = input.Email,
            UserId = input.UserId
        };

        return await newsletters.SubscribeAsync(dto);
    }

    public async Task<bool> UnsubscribeNewsletter(
        Guid id,
        [Service] INewsletterService newsletters)
    {
        return await newsletters.UnsubscribeAsync(id);
    }

    // DJ TOP 10 MUTATIONS
    public async Task<Guid> CreateDjTop10Entry(
        CreateDjTop10Input input,
        [Service] IDJTop10Service djTop10Service)
    {
        var dto = new DJTop10CreateDto
        {
            DJId = input.DjId,
            SongId = input.SongId
        };

        return await djTop10Service.CreateAsync(dto);
    }

    public async Task<bool> DeleteDjTop10Entry(
        Guid id,
        [Service] IDJTop10Service djTop10Service)
    {
        await djTop10Service.DeleteAsync(id);
        return true;
    }

    // SONG MUTATIONS
    public async Task<Guid> CreateSong(
        CreateSongInput input,
        [Service] ISongService songService)
    {
        var dto = new CreateSongDto
        {
            Title = input.Title,
            Artist = input.Artist,
            Album = input.Album,
            Duration = input.Duration,
            SpotifyId = input.SpotifyId
        };

        return await songService.AddSongAsync(dto);
    }

    // SITE SETTINGS MUTATIONS
    public async Task<SiteSettingsDto> UpdateSiteSettings(
        UpdateSiteSettingsInput input,
        [Service] ISiteSettingsService siteSettingsService)
    {
        var dto = new UpdateSiteSettingsDto
        {
            Id = input.Id,
            SiteName = input.SiteName,
            Tagline = input.Tagline,
            LogoUrl = input.LogoUrl,
            FaviconUrl = input.FaviconUrl,
            PrimaryColor = input.PrimaryColor,
            SecondaryColor = input.SecondaryColor,
            AccentColor = input.AccentColor,
            HeroTitle = input.HeroTitle,
            HeroSubtitle = input.HeroSubtitle,
            HeroCtaText = input.HeroCtaText,
            HeroCtaLink = input.HeroCtaLink,
            HeroBackgroundImageUrl = input.HeroBackgroundImageUrl,
            HeroBackgroundVideoUrl = input.HeroBackgroundVideoUrl,
            HeroOverlayOpacity = input.HeroOverlayOpacity,
            ContactEmail = input.ContactEmail,
            ContactPhone = input.ContactPhone,
            ContactAddress = input.ContactAddress,
            FacebookUrl = input.FacebookUrl,
            InstagramUrl = input.InstagramUrl,
            TwitterUrl = input.TwitterUrl,
            YouTubeUrl = input.YouTubeUrl,
            TikTokUrl = input.TikTokUrl,
            SoundCloudUrl = input.SoundCloudUrl,
            DefaultEventImageUrl = input.DefaultEventImageUrl,
            DefaultDjImageUrl = input.DefaultDjImageUrl,
            DefaultVenueImageUrl = input.DefaultVenueImageUrl,
            EnableNewsletter = input.EnableNewsletter,
            EnableNotifications = input.EnableNotifications,
            EnableReviews = input.EnableReviews,
            EnableGamification = input.EnableGamification,
            EnableSubscriptions = input.EnableSubscriptions,
            MetaDescription = input.MetaDescription,
            MetaKeywords = input.MetaKeywords,
            FooterText = input.FooterText,
            CopyrightText = input.CopyrightText
        };

        return await siteSettingsService.UpdateAsync(dto);
    }

    // FOLLOW MUTATIONS
    public async Task<bool> FollowDj(
        FollowDjInput input,
        [Service] IFollowService followService)
    {
        await followService.FollowDjAsync(input.UserId, input.DjId);
        return true;
    }

    public async Task<bool> UnfollowDj(
        FollowDjInput input,
        [Service] IFollowService followService)
    {
        await followService.UnfollowDjAsync(input.UserId, input.DjId);
        return true;
    }

    // TICKET MUTATIONS
    public async Task<TicketDto> PurchaseTicket(
        PurchaseTicketInput input,
        [Service] ITicketService ticketService)
    {
        var dto = new CreateTicketDto
        {
            EventId = input.EventId,
            UserId = input.UserId
        };

        return await ticketService.CreateTicketAsync(dto);
    }

    public async Task<bool> CheckInTicket(
        Guid ticketId,
        [Service] ITicketService ticketService)
    {
        return await ticketService.CheckInTicketAsync(ticketId);
    }

    public async Task<bool> InvalidateTicket(
        Guid ticketId,
        [Service] ITicketService ticketService)
    {
        return await ticketService.InvalidateTicketAsync(ticketId);
    }

    public async Task<bool> DeleteTicket(
        Guid ticketId,
        [Service] ITicketService ticketService)
    {
        await ticketService.DeleteAsync(ticketId);
        return true;
    }
}

public class RegisterInput
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginInput
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class CreateEventInput
{
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public Guid VenueId { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<Guid>? GenreIds { get; set; }
    public List<Guid>? DjIds { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
}

public class UpdateEventInput
{
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public Guid VenueId { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<Guid>? GenreIds { get; set; }
    public List<Guid>? DjIds { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
}

public class CreateDjInput
{
    public string StageName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string? LongBio { get; set; }
    public string? Tagline { get; set; }
    public string Genre { get; set; } = string.Empty;
    public string SocialLinks { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Specialties { get; set; }
    public string? Achievements { get; set; }
    public int? YearsExperience { get; set; }
    public string? InfluencedBy { get; set; }
    public string? EquipmentUsed { get; set; }
    public string UserId { get; set; } = string.Empty;
    public List<string>? TopTracks { get; set; }
}

public class UpdateDjInput
{
    public string StageName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string? LongBio { get; set; }
    public string? Tagline { get; set; }
    public string Genre { get; set; } = string.Empty;
    public string SocialLinks { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Specialties { get; set; }
    public string? Achievements { get; set; }
    public int? YearsExperience { get; set; }
    public string? InfluencedBy { get; set; }
    public string? EquipmentUsed { get; set; }
    public List<string>? TopTracks { get; set; }
}

public class CreateGenreInput
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateGenreInput
{
    public string Name { get; set; } = string.Empty;
}

public class CreateVenueInput
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int Capacity { get; set; }
    public string ContactEmail { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateVenueInput : CreateVenueInput
{
}

public class CreateContactMessageInput
{
    public string UserId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class CreateNewsletterInput
{
    public string Email { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}

public class CreateDjTop10Input
{
    public Guid DjId { get; set; }
    public Guid SongId { get; set; }
}

public class FollowDjInput
{
    public Guid DjId { get; set; }
    public string UserId { get; set; } = string.Empty;
}

public class PurchaseTicketInput
{
    public Guid EventId { get; set; }
    public string UserId { get; set; } = string.Empty;
}

public class CreateSongInput
{
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string? Album { get; set; }
    public int Duration { get; set; }
    public string? SpotifyId { get; set; }
}

public class UpdateSiteSettingsInput
{
    public Guid Id { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public string SecondaryColor { get; set; } = string.Empty;
    public string AccentColor { get; set; } = string.Empty;
    public string HeroTitle { get; set; } = string.Empty;
    public string HeroSubtitle { get; set; } = string.Empty;
    public string HeroCtaText { get; set; } = string.Empty;
    public string HeroCtaLink { get; set; } = string.Empty;
    public string HeroBackgroundImageUrl { get; set; } = string.Empty;
    public string HeroBackgroundVideoUrl { get; set; } = string.Empty;
    public decimal HeroOverlayOpacity { get; set; }
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string ContactAddress { get; set; } = string.Empty;
    public string FacebookUrl { get; set; } = string.Empty;
    public string InstagramUrl { get; set; } = string.Empty;
    public string TwitterUrl { get; set; } = string.Empty;
    public string YouTubeUrl { get; set; } = string.Empty;
    public string TikTokUrl { get; set; } = string.Empty;
    public string SoundCloudUrl { get; set; } = string.Empty;
    public string DefaultEventImageUrl { get; set; } = string.Empty;
    public string DefaultDjImageUrl { get; set; } = string.Empty;
    public string DefaultVenueImageUrl { get; set; } = string.Empty;
    public bool EnableNewsletter { get; set; }
    public bool EnableNotifications { get; set; }
    public bool EnableReviews { get; set; }
    public bool EnableGamification { get; set; }
    public bool EnableSubscriptions { get; set; }
    public string MetaDescription { get; set; } = string.Empty;
    public string MetaKeywords { get; set; } = string.Empty;
    public string FooterText { get; set; } = string.Empty;
    public string CopyrightText { get; set; } = string.Empty;
}
