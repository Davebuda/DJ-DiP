namespace DJDiP.Application.DTO.ContactMessageDTO
{
    public class ContactMessageCreateDto
    {
        public string? Subject { get; set; }
        public required string  Message { get; set; } 
        public required string UserId { get; set; }
    }
}
