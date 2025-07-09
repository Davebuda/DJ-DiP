namespace DJDiP.Application.DTOs.DJTop10
{
    public class DJTop10ListCreateDto
    {
        public Guid DJId { get; set; }
        public List<Guid> SongIds { get; set; } = new();
    }
}
