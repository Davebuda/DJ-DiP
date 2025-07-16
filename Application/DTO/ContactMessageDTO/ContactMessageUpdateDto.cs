namespace DJDiP.Application.DTOs.ContactMessage
{
    public class ContactMessageUpdateDto
    {
        public string? Subject { get; set; }
        public required string Message { get; set; }
    }
}
