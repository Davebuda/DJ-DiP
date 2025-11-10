using DJDiP.Application.Interfaces;
using DJDiP.Application.DTO.EventDTO;
using DJDiP.Domain.Models;

namespace DJDiP.Application.Services
{
    public class EventService : IEventService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EventService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<EventListDto>> GetAllAsync()
        {
            var events = await _unitOfWork.Events.GetAllAsync();
            return events.Select(e => new EventListDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Date = e.Date,
                Price = e.Price,
                ImageUrl = e.ImageUrl,
                Venue = new VenueDto
                {
                    Id = e.Venue.Id,
                    Name = e.Venue.Name
                }
            }).ToList();
        }

        public async Task<DetailEventDto?> GetByIdAsync(Guid id)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(id);
            if (ev == null) return null;

            return new DetailEventDto
            {
                Id = ev.Id,
                Title = ev.Title,
                Date = ev.Date,
                VenueId = ev.Venue.Id,
                Price = ev.Price,
                Description = ev.Description,
                GenreIds = ev.Genres.Select(g => g.Id).ToList(),
                DJIds = ev.EventDJs.Select(d => d.DJId).ToList(),
                ImageUrl = ev.ImageUrl,
                VideoUrl = ev.VideoUrl
            };
        }

        public async Task<Guid> CreateAsync(CreateEventDto dto)
        {
            var ev = new Event
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Date = dto.Date,
                Price = dto.Price,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                VideoUrl = dto.VideoUrl
            };

            await _unitOfWork.Events.AddAsync(ev);
            await _unitOfWork.SaveChangesAsync();
            return ev.Id;
        }

        public async Task UpdateAsync(Guid id, UpdateEventDto dto)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(id);
            if (ev == null) throw new ArgumentException("Event not found");

            ev.Title = dto.Title;
            ev.Date = dto.Date;
            ev.Price = dto.Price;
            ev.Description = dto.Description;
            ev.ImageUrl = dto.ImageUrl;
            ev.VideoUrl = dto.VideoUrl;

            await _unitOfWork.Events.UpdateAsync(ev);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(id);
            if (ev == null) return;
            await _unitOfWork.Events.DeleteAsync(ev);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
