namespace DJDiP.Application.DTO.TicketDTO
{
    public class CreateTicketDto
    {
        public Guid EventId { get; set; }
        public string UserId { get; set; } = string.Empty;
    }
}