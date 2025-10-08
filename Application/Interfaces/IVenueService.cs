using DJDiP.Application.DTO.VenueDTO;

namespace DJDiP.Application.Interfaces
{
    public interface IVenueService
    {
        Task<Guid> CreateAsync(CreateVenueDto dto);
        Task UpdateAsync(Guid id, UpdateVenueDto dto);
        Task DeleteAsync(Guid id);
    }
}
