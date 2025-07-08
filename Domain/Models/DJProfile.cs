namespace DJDiP.Domain.Models
{
    public class DJProfile
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Bio { get; set; }
        public string? SocialLinks { get; set; }
        public List<Genre> Genres { get; set; } = new();
        public List<DJTop10> DJTop10s { get; set; } = new();
        public List<Event> Events { get; set; } = new();
        public List<EventDJ> EventDJs { get; set; } = new();

    }


}