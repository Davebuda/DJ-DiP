using DJDiP.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace DJDiP.Infrastructure.Persistance
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Add new columns to existing tables (EnsureCreated won't add columns to existing tables)
            try
            {
                await context.Database.ExecuteSqlRawAsync(
                    @"ALTER TABLE ""Songs"" ADD COLUMN IF NOT EXISTS ""SpotifyUrl"" TEXT;
                      ALTER TABLE ""Songs"" ADD COLUMN IF NOT EXISTS ""SoundCloudUrl"" TEXT;");
            }
            catch { /* columns already exist or table doesn't exist yet (handled by EnsureCreated) */ }

            // Check if data already exists
            if (await context.SiteSettings.AnyAsync())
            {
                return; // DB has been seeded
            }

            // Seed Admin User — password must be set via ADMIN_DEFAULT_PASSWORD env var
            var adminPassword = Environment.GetEnvironmentVariable("ADMIN_DEFAULT_PASSWORD")
                ?? throw new InvalidOperationException(
                    "ADMIN_DEFAULT_PASSWORD environment variable must be set for initial database seeding.");

            var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@djdip.com";

            var adminUser = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                Email = adminEmail,
                FullName = "DJ DiP Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = 2, // Admin
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await context.ApplicationUsers.AddAsync(adminUser);

            // Seed Sample Venue
            var venue = new Venue
            {
                Id = Guid.NewGuid(),
                Name = "The Underground Club",
                Description = "Industrial warehouse turned nightlife sanctuary.",
                Address = "Köpenicker Str. 70",
                City = "Berlin",
                Country = "Germany",
                Capacity = 1000,
                ContactEmail = "info@underground.club",
                ImageUrl = "/media/defaults/venue.jpg"
            };

            await context.Venues.AddAsync(venue);

            // Seed SiteSettings
            var siteSettings = new SiteSetting
            {
                Id = Guid.NewGuid(),
                SiteName = "KlubN",
                Tagline = "Experience the underground",
                PrimaryColor = "#FF0080",
                SecondaryColor = "#00FF9F",
                AccentColor = "#000000",
                HeroTitle = "LET'S GO KLUBN",
                HeroSubtitle = "Immersive club culture, curated lineups, and underground energy — welcome to the KlubN experience.",
                HeroCtaText = "JOIN THE MOVEMENT",
                HeroCtaLink = "/events",
                HeroBackgroundImageUrl = "/media/sections/hero/hero-background.jpg",
                HeroOverlayOpacity = 0.5m,
                EnableNewsletter = true,
                EnableNotifications = true,
                EnableReviews = true,
                EnableGamification = true,
                EnableSubscriptions = true,
                MetaDescription = "KlubN - The ultimate platform for electronic music events and DJ culture",
                CopyrightText = $"© {DateTime.UtcNow.Year} KlubN. All rights reserved."
            };

            await context.SiteSettings.AddAsync(siteSettings);

            // Save independent entities first
            await context.SaveChangesAsync();

            // Seed Sample Genres (no DJ profile association initially)
            var genres = new List<Genre>
            {
                new Genre { Id = Guid.NewGuid(), Name = "Techno" },
                new Genre { Id = Guid.NewGuid(), Name = "House" },
                new Genre { Id = Guid.NewGuid(), Name = "Trance" }
            };

            await context.Genres.AddRangeAsync(genres);
            await context.SaveChangesAsync();

            // Seed Sample DJ Profiles
            var djProfiles = new List<DJProfile>
            {
                new DJProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = adminUser.Id,
                    Name = "DJ Shadow",
                    StageName = "Shadow",
                    Bio = "Pioneer of underground techno",
                    ProfilePictureUrl = "/media/defaults/dj.jpg",
                    CreatedAt = DateTime.UtcNow
                },
                new DJProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = adminUser.Id,
                    Name = "Luna Beats",
                    StageName = "Luna",
                    Bio = "House music specialist",
                    ProfilePictureUrl = "/media/defaults/dj.jpg",
                    CreatedAt = DateTime.UtcNow
                },
                new DJProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = adminUser.Id,
                    Name = "Echo Pulse",
                    StageName = "Echo",
                    Bio = "Trance and progressive",
                    ProfilePictureUrl = "/media/defaults/dj.jpg",
                    CreatedAt = DateTime.UtcNow
                },
                new DJProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = adminUser.Id,
                    Name = "Neon Flux",
                    StageName = "Neon",
                    Bio = "Electronic music producer",
                    ProfilePictureUrl = "/media/defaults/dj.jpg",
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.DJProfiles.AddRangeAsync(djProfiles);
            await context.SaveChangesAsync();

            // Seed Sample Event
            var sampleEvent = new Event
            {
                Id = Guid.NewGuid(),
                Title = "KlubN Opening Night",
                Description = "Join us for the grand opening of KlubN featuring top underground DJs",
                Date = DateTime.UtcNow.AddDays(14),
                Price = 25.00m,
                ImageUrl = "/media/defaults/event.jpg",
                VenueId = venue.Id
            };

            await context.Events.AddAsync(sampleEvent);
            await context.SaveChangesAsync();
        }
    }
}
