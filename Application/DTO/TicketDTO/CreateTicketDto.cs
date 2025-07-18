namespace Application.DTO.TicketDTO
{
public class CreateTicketDto
{
    public Guid UserId { get; set; }
    public Guid EventId { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal Price { get; set; } 
    public string TicketType { get; set; } = string.Empty;
}
}