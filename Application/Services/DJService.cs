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
            return djs.Select(dj => new DJProfileListItemDto
            {
                Id = dj.Id,
                StageName = dj.Name,
                Genre = string.Join(", ", dj.Genres.Select(g => g.Name)),
                ProfilePictureUrl = string.Empty
            });
        }

        public async Task<DJProfileDetailDto?> GetByIdAsync(Guid id)
        {
            var dj = await _unitOfWork.DJProfiles.GetByIdAsync(id);
            if (dj == null) return null;

            return new DJProfileDetailDto
            {
                Id = dj.Id,
                StageName = dj.Name,
                Bio = dj.Bio,
                SocialLinks = dj.SocialLinks ?? string.Empty,
                Genre = string.Join(", ", dj.Genres.Select(g => g.Name)),
                ProfilePictureUrl = string.Empty,
                UserId = string.Empty,
                GenreIds = dj.Genres.Select(g => g.Id).ToList()
            };
        }

        public async Task<Guid> CreateAsync(CreateDJProfileDto dto)
        {
            var dj = new DJProfile
            {
                Id = Guid.NewGuid(),
                Name = dto.StageName,
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

            dj.Name = dto.StageName;
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
}
