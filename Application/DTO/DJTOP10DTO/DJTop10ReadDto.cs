namespace DJDiP.Application.DTO.DJTop10DTO
{
    public class DJTop10ReadDto
    {
        public Guid Id { get; set; }

        public Guid DJId { get; set; }
        public string DJStageName { get; set; } = string.Empty;

        public Guid SongId { get; set; }
        public string SongTitle { get; set; } = string.Empty;
    }
}
