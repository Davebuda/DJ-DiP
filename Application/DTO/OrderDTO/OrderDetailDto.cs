namespace Application.DTO.OrderDTO
{
public class OrderDetailDto
{
    public Guid Id { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
    public PaymentDto? Payment { get; set; }
}
}