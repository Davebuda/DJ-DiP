namespace DJDiP.Application.DTO.DJProfileDTO
{
    public class DJProfileDetailDto
    {
        public Guid Id { get; set; }
        public string StageName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string SocialLinks { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty; // kobling til brukeren
        public List<Guid> GenreIds { get; set; } = new();
    }
}
