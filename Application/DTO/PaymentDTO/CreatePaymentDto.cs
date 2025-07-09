namespace Application.DTO.PaymentDTO
{
public class CreatePaymentDto
{
    public Guid OrderId { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
    public string Currency { get; set; } = "NOK";
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }

    public string ReceiptUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Succeeded";
}
}