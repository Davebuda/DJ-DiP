namespace DJDiP.Application.DTO.DJProfileDTO
{
    public class DJProfileListItemDto
    {
        public int Id { get; set; }
        public string StageName { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }
}
