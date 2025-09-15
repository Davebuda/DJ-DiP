namespace DJDiP.Domain.Models
{
    public class ApplicationUser
    {
        public required string Id { get; set; }

        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Provider { get; set; }
        public List<Order> Orders { get; set; } = new();
        public List<Ticket> Tickets { get; set; } = new();
        public List<ContactMessage> ContactMessages { get; set; } = new();
        public List<Notification> Notifications { get; set; } = new();
        

}
}