
using DJDiP.Domain.Models;
namespace DJDiP.Application.DTO.EventDTO;


public interface IEventService
{
    Task<IEnumerable<EventDJ>> GetAllAsync();
    Task<DetailEventDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(CreateEventDto dto);
    Task UpdateAsync(Guid id, UpdateEventDto dto);
    Task DeleteAsync(Guid id);
}

