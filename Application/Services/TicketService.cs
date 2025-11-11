using DJDiP.Application.DTO.TicketDTO;
using DJDiP.Application.Interfaces;
using DJDiP.Domain.Models;

namespace DJDiP.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TicketService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsByUserIdAsync(string userId)
        {
            var tickets = await _unitOfWork.Tickets.GetTicketsByUserIdAsync(userId);
            return tickets.Select(t => MapToDto(t)).ToList();
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsByEventIdAsync(Guid eventId)
        {
            var tickets = await _unitOfWork.Tickets.GetTicketsByEventIdAsync(eventId);
            return tickets.Select(t => MapToDto(t)).ToList();
        }

        public async Task<TicketDto?> GetTicketByIdAsync(Guid ticketId)
        {
            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            return ticket == null ? null : MapToDto(ticket);
        }

        public async Task<TicketDto> CreateTicketAsync(CreateTicketDto ticketDto)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(ticketDto.EventId)
                ?? throw new ArgumentException("Event not found");

            var user = await _unitOfWork.Users.GetByIdAsync(ticketDto.UserId)
                ?? throw new ArgumentException("User not found");

            var ticket = new Ticket
            {
                Id = Guid.NewGuid(),
                EventId = ev.Id,
                UserId = user.Id,
                Price = ev.Price,
                TicketNumber = $"TKT-{Guid.NewGuid():N}".Substring(0, 12).ToUpperInvariant(),
                QRCode = Guid.NewGuid().ToString("N")
            };

            await _unitOfWork.Tickets.AddAsync(ticket);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(ticket, ev);
        }

        public async Task<bool> CheckInTicketAsync(Guid ticketId)
        {
            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                return false;
            }

            ticket.IsUsed = true;
            ticket.CheckInTime = DateTime.UtcNow;
            await _unitOfWork.Tickets.UpdateAsync(ticket);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> InvalidateTicketAsync(Guid ticketId)
        {
            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                return false;
            }

            ticket.IsValid = false;
            await _unitOfWork.Tickets.UpdateAsync(ticket);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task DeleteAsync(Guid ticketId)
        {
            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                return;
            }

            await _unitOfWork.Tickets.DeleteAsync(ticket);
            await _unitOfWork.SaveChangesAsync();
        }

        private TicketDto MapToDto(Ticket ticket, Event? ev = null)
        {
            ev ??= ticket.Event ?? throw new InvalidOperationException("Ticket is missing event navigation");

            return new TicketDto
            {
                Id = ticket.Id,
                EventId = ticket.EventId,
                UserId = ticket.UserId,
                PurchaseDate = ticket.PurchaseDate,
                IsValid = ticket.IsValid,
                IsCheckedIn = ticket.IsUsed,
                TicketNumber = ticket.TicketNumber,
                Price = ticket.Price,
                Event = new TicketEventDto
                {
                    Id = ev.Id,
                    Title = ev.Title,
                    Date = ev.Date,
                    VenueName = ev.Venue?.Name ?? "TBA",
                    City = ev.Venue?.City ?? string.Empty,
                    ImageUrl = ev.ImageUrl ?? string.Empty
                }
            };
        }
    }
}
