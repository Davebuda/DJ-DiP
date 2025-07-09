namespace DJDiP.Application.DTOs.ContactMessage
{
    public class ContactMessageReadDto
    {
        public int Id { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
        public string UserFullName { get; set; }  // Optional: useful for admin views
        public DateTime CreatedAt { get; set; }
    }
}
