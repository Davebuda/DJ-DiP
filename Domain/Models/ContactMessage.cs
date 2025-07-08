namespace DJDiP.Domain.Models
{
    public class ContactMessage
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime SentAt { get; set; }

        public Guid UserId { get; set; }

        public ApplicationUser User { get; set; } = null!;
    }
}