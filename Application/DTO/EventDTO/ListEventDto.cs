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
        public VenueDto Venue { get; set; } = null!;
    }

    public class VenueDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
