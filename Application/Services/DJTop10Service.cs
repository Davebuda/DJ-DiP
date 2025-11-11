using DJDiP.Application.DTO.DJTop10DTO;
using DJDiP.Application.Interfaces;
using DJDiP.Domain.Models;

namespace DJDiP.Application.Services
{
    public class DJTop10Service : IDJTop10Service
    {
        private readonly IUnitOfWork _unitOfWork;

        public DJTop10Service(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<DJTop10ListDto>> GetAllAsync()
        {
            var entries = await _unitOfWork.DJTop10s.GetAllAsync();
            var djs = await _unitOfWork.DJProfiles.GetAllAsync();
            var songs = await _unitOfWork.Songs.GetAllAsync();

            var djLookup = djs.ToDictionary(d => d.Id, d => d.StageName ?? d.Name ?? string.Empty);
            var songLookup = songs.ToDictionary(s => s.Id, s => s.Title ?? string.Empty);

            return entries
                .GroupBy(entry => entry.DJId)
                .Select(group => new DJTop10ListDto
                {
                    DJId = group.Key,
                    DJStageName = djLookup.TryGetValue(group.Key, out var stageName) ? stageName : "Unknown DJ",
                    Top10Songs = group.Select(entry => MapToReadDto(entry, djLookup, songLookup)).ToList()
                })
                .ToList();
        }

        public async Task<DJTop10ReadDto?> GetByIdAsync(Guid id)
        {
            var entry = await _unitOfWork.DJTop10s.GetByIdAsync(id);
            if (entry == null)
            {
                return null;
            }

            var dj = await _unitOfWork.DJProfiles.GetByIdAsync(entry.DJId);
            var song = await _unitOfWork.Songs.GetByIdAsync(entry.SongId);

            return new DJTop10ReadDto
            {
                Id = entry.Id,
                DJId = entry.DJId,
                DJStageName = dj?.StageName ?? dj?.Name ?? "Unknown DJ",
                SongId = entry.SongId,
                SongTitle = song?.Title ?? "Unknown Track"
            };
        }

        public async Task<Guid> CreateAsync(DJTop10CreateDto dto)
        {
            var dj = await _unitOfWork.DJProfiles.GetByIdAsync(dto.DJId);
            if (dj == null)
            {
                throw new ArgumentException("DJ not found");
            }

            var song = await _unitOfWork.Songs.GetByIdAsync(dto.SongId);
            if (song == null)
            {
                throw new ArgumentException("Song not found");
            }

            var entry = new DJTop10
            {
                Id = Guid.NewGuid(),
                DJId = dto.DJId,
                SongId = dto.SongId
            };

            await _unitOfWork.DJTop10s.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();

            return entry.Id;
        }

        public async Task DeleteAsync(Guid id)
        {
            var entry = await _unitOfWork.DJTop10s.GetByIdAsync(id);
            if (entry == null)
            {
                return;
            }

            await _unitOfWork.DJTop10s.DeleteAsync(entry);
            await _unitOfWork.SaveChangesAsync();
        }

        private static DJTop10ReadDto MapToReadDto(
            DJTop10 entry,
            IReadOnlyDictionary<Guid, string> djLookup,
            IReadOnlyDictionary<Guid, string> songLookup)
        {
            return new DJTop10ReadDto
            {
                Id = entry.Id,
                DJId = entry.DJId,
                DJStageName = djLookup.TryGetValue(entry.DJId, out var stageName) && !string.IsNullOrWhiteSpace(stageName)
                    ? stageName
                    : "Unknown DJ",
                SongId = entry.SongId,
                SongTitle = songLookup.TryGetValue(entry.SongId, out var title) && !string.IsNullOrWhiteSpace(title)
                    ? title
                    : "Unknown Track"
            };
        }
    }
}
