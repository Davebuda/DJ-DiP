namespace Application.DTO.TicketDTO
{
public class CreateTicketDto
{
    public Guid UserId { get; set; }
    public Guid EventId { get; set; }
}
}