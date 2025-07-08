namespace DJDiP.Domain.Models
{
    public class Song
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? CoverArtURL { get; set; }
        public List<DJTop10> DJTop10s { get; set; } = new();
        }
    }
