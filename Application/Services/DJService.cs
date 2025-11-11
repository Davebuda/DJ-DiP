using System.Text.Json;
using Application.DTO.DJProfile;
using DJDiP.Application.DTO.DJProfileDTO;
using DJDiP.Application.Interfaces;
using DJDiP.Domain.Models;

namespace DJDiP.Application.Services
{
    public class DJService : IDJService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DJService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<DJProfileListItemDto>> GetAllAsync()
        {
            var djs = await _unitOfWork.DJProfiles.GetAllAsync();
            var followerCounts = await _unitOfWork.UserFollowDJs.GetFollowerCountsAsync(djs.Select(dj => dj.Id));

            return djs.Select(dj => new DJProfileListItemDto
            {
                Id = dj.Id,
                Name = dj.Name,
                StageName = dj.StageName ?? dj.Name,
                Bio = dj.Bio,
                Genre = dj.Genres.Any() ? string.Join(", ", dj.Genres.Select(g => g.Name)) : dj.Genre ?? string.Empty,
                ProfilePictureUrl = dj.ProfilePictureUrl ?? string.Empty,
                Tagline = dj.Tagline,
                CoverImageUrl = dj.CoverImageUrl,
                FollowerCount = followerCounts.TryGetValue(dj.Id, out var count) ? count : 0
            });
        }

        public async Task<DJProfileDetailDto?> GetByIdAsync(Guid id)
        {
            var dj = await _unitOfWork.DJProfiles.GetDJWithEventsAsync(id);
            if (dj == null) return null;

            var followerCount = await _unitOfWork.UserFollowDJs.CountByDjIdAsync(id);
            var events = dj.EventDJs?
                .Where(ed => ed.Event != null)
                .Select(ed => ed.Event!)
                .OrderBy(e => e.Date)
                .Take(4)
                .Select(e => new DJProfileEventSummaryDto
                {
                    EventId = e.Id,
                    Title = e.Title,
                    Date = e.Date,
                    VenueName = e.Venue?.Name ?? "TBA",
                    City = e.Venue?.City,
                    Price = e.Price,
                    ImageUrl = e.ImageUrl
                })
                .ToList() ?? new List<DJProfileEventSummaryDto>();

            return new DJProfileDetailDto
            {
                Id = dj.Id,
                StageName = dj.StageName ?? dj.Name,
                Name = dj.Name,
                Bio = dj.Bio,
                LongBio = dj.LongBio,
                SocialLinks = DJProfileMappings.ParseSocialLinks(dj.SocialLinks),
                Genre = dj.Genres.Any() ? string.Join(", ", dj.Genres.Select(g => g.Name)) : dj.Genre ?? string.Empty,
                ProfilePictureUrl = dj.ProfilePictureUrl ?? string.Empty,
                CoverImageUrl = dj.CoverImageUrl,
                Tagline = dj.Tagline,
                Specialties = dj.Specialties,
                Achievements = dj.Achievements,
                YearsExperience = dj.YearsExperience,
                InfluencedBy = dj.InfluencedBy,
                EquipmentUsed = dj.EquipmentUsed,
                TopTracks = DJProfileMappings.ParseTopTracks(dj.Top10SongTitles),
                GenreIds = dj.Genres.Select(g => g.Id).ToList(),
                FollowerCount = followerCount,
                UpcomingEvents = events
            };
        }

        public async Task<Guid> CreateAsync(CreateDJProfileDto dto)
        {
            var dj = new DJProfile
            {
                Id = Guid.NewGuid(),
                Name = dto.FullName ?? dto.StageName,
                StageName = dto.StageName,
                Bio = dto.Bio,
                SocialLinks = dto.SocialLinks
            };

            await _unitOfWork.DJProfiles.AddAsync(dj);
            await _unitOfWork.SaveChangesAsync();
            return dj.Id;
        }

        public async Task UpdateAsync(Guid id, UpdateDJProfileDto dto)
        {
            var dj = await _unitOfWork.DJProfiles.GetByIdAsync(id);
            if (dj == null) throw new ArgumentException("DJ not found");

            dj.Name = dto.FullName ?? dto.StageName;
            dj.StageName = dto.StageName;
            dj.Bio = dto.Bio;
            dj.SocialLinks = dto.SocialLinks;

            await _unitOfWork.DJProfiles.UpdateAsync(dj);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var dj = await _unitOfWork.DJProfiles.GetByIdAsync(id);
            if (dj == null) return;
            await _unitOfWork.DJProfiles.DeleteAsync(dj);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    internal static class DJProfileMappings
    {
        internal static List<SocialLinkDto> ParseSocialLinks(string? rawSocialLinks)
        {
            if (string.IsNullOrWhiteSpace(rawSocialLinks))
            {
                return new List<SocialLinkDto>();
            }

            try
            {
                var parsedDictionary = JsonSerializer.Deserialize<Dictionary<string, string>>(rawSocialLinks);
                if (parsedDictionary != null && parsedDictionary.Any())
                {
                    return parsedDictionary
                        .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
                        .Select(pair => new SocialLinkDto
                        {
                            Label = pair.Key,
                            Url = pair.Value
                        })
                        .ToList();
                }

                var parsedList = JsonSerializer.Deserialize<List<SocialLinkDto>>(rawSocialLinks);
                if (parsedList != null && parsedList.Any())
                {
                    return parsedList;
                }
            }
            catch
            {
                // ignore json errors and attempt fallback below
            }

            return rawSocialLinks
                .Split(new[] { '\n', ';', ',' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select((entry, index) => new SocialLinkDto
                {
                    Label = $"Link {index + 1}",
                    Url = entry
                })
                .ToList();
        }

        internal static List<string> ParseTopTracks(string? rawTopTracks)
        {
            if (string.IsNullOrWhiteSpace(rawTopTracks))
            {
                return new List<string>();
            }

            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(rawTopTracks);
                if (parsed != null && parsed.Count > 0)
                {
                    return parsed;
                }
            }
            catch
            {
                // fallback to manual parsing
            }

            return rawTopTracks
                .Split(new[] { '\n', ';', ',' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
        }
    }
}
