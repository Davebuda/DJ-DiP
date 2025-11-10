namespace DJDiP.Domain.Models
{
    public class Event
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public Guid VenueId { get; set; }
        public Venue Venue { get; set; } = null!;
        public decimal Price { get; set; }
        public List<EventDJ> EventDJs { get; set; } = new();

        public string Description { get; set; } = string.Empty;
        public List<Genre> Genres { get; set; } = new();
        public List<Ticket> Tickets { get; set; } = new();
        public List<OrderItem> OrderItems  { get; set;} = new();
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
    }
}
