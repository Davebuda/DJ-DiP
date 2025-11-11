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
        public string TicketNumber { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public TicketEventDto Event { get; set; } = new();
    }

    public class TicketEventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }
}
