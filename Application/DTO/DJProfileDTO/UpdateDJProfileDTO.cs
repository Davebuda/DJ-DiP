namespace Application.DTO.DJProfile
{
    public class UpdateDJProfileDto
    {

        public int Id { get; set; } // viktig for å identifisere hvilken profil som skal endres
        public string StageName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string SocialLinks { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public List<string>? Top10SongTitles { get; set; } // eksempel


}
}