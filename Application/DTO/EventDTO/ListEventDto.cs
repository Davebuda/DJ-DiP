using DJDiP.Domain.Models;

namespace DJDiP.Application.DTO.EventDTO
{
    public class EventListDto
    {
        public List<Event> Events { get; set; } = new();
    }
}
