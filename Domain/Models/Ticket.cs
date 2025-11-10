namespace DJDiP.Domain.Models
{
    public class Ticket
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string UserId { get; set; }
        public string TicketNumber { get; set; } = Guid.NewGuid().ToString();
        public string QRCode { get; set; } = Guid.NewGuid().ToString();
        public decimal Price { get; set; }
        public bool IsValid { get; set; } = true;
        public bool IsUsed { get; set; } = false;
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
        public DateTime? CheckInTime { get; set; }

        // Navigation Properties
        public Event Event { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}