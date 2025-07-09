namespace Application.DTO.TicketDTO
{
public class TicketDto
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;

    public Guid EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }

    public DateTime PurchaseDate { get; set; }
    public bool IsValid { get; set; }
    public DateTime? CheckInTime { get; set; }
}

}