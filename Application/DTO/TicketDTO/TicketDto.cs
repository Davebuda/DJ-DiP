namespace DJDiP.Application.DTO.TicketDTO
{
    public class TicketDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public bool IsValid { get; set; }
        public bool IsCheckedIn { get; set; }
    }
}