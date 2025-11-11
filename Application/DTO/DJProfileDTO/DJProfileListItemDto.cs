namespace DJDiP.Application.DTO.DJProfileDTO
{
    public class DJProfileListItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string StageName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string? Tagline { get; set; }
        public string? CoverImageUrl { get; set; }
        public int FollowerCount { get; set; }
    }
}
