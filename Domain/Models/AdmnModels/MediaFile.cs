namespace DJDiP.Domain.Models
{
    public class MediaFile
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string MediaType { get; set; } = null!;           // e.g., "image/jpeg"
        public long FileSize { get; set; }                      // In bytes
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optional Relations:
        public Guid? EventId { get; set; }
        public Event? Event { get; set; }

        public Guid? DJId { get; set; }
        public DJProfile? DJ { get; set; }
    }
}