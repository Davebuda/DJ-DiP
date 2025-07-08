namespace DJDiP.Domain.Models
{
    public class ApplicationUser
    {
        public required string Id { get; set; }

        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Provider { get; set; }
        public List<Order> Order { get; set; } = new();
        public List<Ticket> Tickets { get; set; } = new();
        public List<ContactMessage> ContactMessage { get; set; } = new();
        public List<Notification> Notification { get; set; } = new();
        

}
}