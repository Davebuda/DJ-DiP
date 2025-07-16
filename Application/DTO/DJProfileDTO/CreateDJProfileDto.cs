namespace Application.DTO.DJProfile
{
    public class CreateDJProfileDto
    {
        public string StageName { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string SocialLinks { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty; // kobling til brukeren
        public List<string>? Top10SongTitles { get; set; } // eksempel

    }
}