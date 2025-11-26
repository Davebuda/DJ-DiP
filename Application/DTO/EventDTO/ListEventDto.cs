namespace DJDiP.Application.DTO.EventDTO
{
    public class EventListDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public EventVenueDto Venue { get; set; } = null!;
        public List<string> Genres { get; set; } = new();
    }

    public class EventVenueDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }
}
