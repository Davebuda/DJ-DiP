namespace Application.DTO.SongDTO
{
public class SongDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string? Genre { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? AudioPreviewUrl { get; set; }
}
}