namespace DJDiP.Application.DTO.ContactMessageDTO
{
    public class ContactMessageReadDto
    {
        public int Id { get; set; }
        public string? Subject { get; set; }
        public required string Message { get; set; }
        public required string UserFullName { get; set; }  // Optional: useful for admin views
        public DateTime CreatedAt { get; set; }
    }
}
