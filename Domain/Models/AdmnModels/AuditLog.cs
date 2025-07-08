namespace DJDiP.Domain.Models
{
    public class AuditLog
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public string Action { get; set; } = null!;           // e.g., "Created Event"
    public string EntityName { get; set; } = null!;       // e.g., "Event"
    public Guid? EntityId { get; set; }                    // Specific entity id
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

}