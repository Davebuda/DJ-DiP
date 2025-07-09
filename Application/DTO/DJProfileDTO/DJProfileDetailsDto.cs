namespace Application.DTO.DJProfile
{
    public class DJProfileDetailDto
{
        public string StageName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string SocialLinks { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty; // kobling til brukeren
    }
}
