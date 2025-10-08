namespace DJDiP.Application.DTO.SongDTO
{
    public class SongDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? Album { get; set; }
        public int Duration { get; set; } // in seconds
        public string? SpotifyId { get; set; }
    }
}