namespace DJDiP.Domain.Models

{
    public class Ticket
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public string UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;
        public DateTime PurchaseDate { get; set; }
        public string TicketNumber { get; set; } = null!;
        public bool IsValid { get; set; }
        public DateTime? CheckInTime { get; set; }
    }
}