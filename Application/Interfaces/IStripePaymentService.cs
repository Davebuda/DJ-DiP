using DJDiP.Application.DTO.PaymentDTO;
using DJDiP.Application.DTO.TicketDTO;

namespace DJDiP.Application.Interfaces
{
    public interface IStripePaymentService
    {
        Task<PaymentIntentDto> CreateEventPaymentIntentAsync(CreatePaymentIntentDto dto);
        Task<TicketDto> ConfirmStripePaymentAndIssueTicketAsync(ConfirmPaymentDto dto);
        Task<bool> ValidateWebhookSignatureAsync(string payload, string signature);
    }
}
