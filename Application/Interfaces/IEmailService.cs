namespace DJDiP.Application.Interfaces
{
    public interface IEmailService
    {
        /// <summary>Sends a ticket purchase confirmation email.</summary>
        Task SendTicketConfirmationAsync(
            string toEmail,
            string toName,
            string ticketNumber,
            string eventTitle,
            DateTime eventDate,
            string venueName,
            string venueCity,
            decimal totalPrice,
            string qrCode);

        /// <summary>Sends a ticket transfer confirmation to the new owner.</summary>
        Task SendTicketTransferConfirmationAsync(
            string toEmail,
            string toName,
            string ticketNumber,
            string eventTitle,
            DateTime eventDate,
            string venueName,
            string qrCode);

        /// <summary>Sends a refund confirmation email.</summary>
        Task SendRefundConfirmationAsync(
            string toEmail,
            string toName,
            string ticketNumber,
            string eventTitle,
            decimal refundAmount,
            string transactionId);
    }
}
