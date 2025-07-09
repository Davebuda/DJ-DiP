public class EventDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<string> GenreNames { get; set; } = new();
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
}
