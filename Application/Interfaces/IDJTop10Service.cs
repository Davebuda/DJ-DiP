using DJDiP.Application.DTO.DJTop10DTO;
using DJDiP.Application.DTO.DJTop10;

namespace Application.Interfaces
{
public interface IDJTop10Service
{
    Task<IEnumerable<DJTop10ListDto>> GetAllAsync();
    Task<DJTop10ReadDto> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(DJTop10CreateDto dto);
    Task DeleteAsync(Guid id);
}}