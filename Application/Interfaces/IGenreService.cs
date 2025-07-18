using DJDiP.Application.DTO.GenreDTO;
namespace DJDiP.Application.Interfaces

{
    public interface IGenreService
    {
        Task<IEnumerable<VenueListDto>> GetAllAsync();
        Task<IEnumerable<GenreDTO>> GetAllAsync();
        Task<Guid> CreateAsync(CreateGenreDto dto);
        Task UpdateAsync(Guid id, UpdateGenreDto dto);
    }
}