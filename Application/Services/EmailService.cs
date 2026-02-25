using DJDiP.Application.Interfaces;
using DJDiP.Application.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace DJDiP.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────
        // Public methods
        // ─────────────────────────────────────────────────────────────

        public async Task SendTicketConfirmationAsync(
            string toEmail, string toName, string ticketNumber,
            string eventTitle, DateTime eventDate, string venueName,
            string venueCity, decimal totalPrice, string qrCode)
        {
            var subject = $"Your ticket for {eventTitle} – {ticketNumber}";
            var html = BuildTicketConfirmationHtml(
                toName, ticketNumber, eventTitle, eventDate,
                venueName, venueCity, totalPrice, qrCode);
            await SendAsync(toEmail, toName, subject, html);
        }

        public async Task SendTicketTransferConfirmationAsync(
            string toEmail, string toName, string ticketNumber,
            string eventTitle, DateTime eventDate, string venueName, string qrCode)
        {
            var subject = $"Ticket transferred to you – {eventTitle}";
            var html = BuildTransferConfirmationHtml(
                toName, ticketNumber, eventTitle, eventDate, venueName, qrCode);
            await SendAsync(toEmail, toName, subject, html);
        }

        public async Task SendRefundConfirmationAsync(
            string toEmail, string toName, string ticketNumber,
            string eventTitle, decimal refundAmount, string transactionId)
        {
            var subject = $"Refund processed – {eventTitle}";
            var html = BuildRefundConfirmationHtml(
                toName, ticketNumber, eventTitle, refundAmount, transactionId);
            await SendAsync(toEmail, toName, subject, html);
        }

        // ─────────────────────────────────────────────────────────────
        // Core send logic
        // ─────────────────────────────────────────────────────────────

        private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            if (!_settings.Enabled)
            {
                _logger.LogInformation(
                    "[EmailService] Email disabled. Would have sent '{Subject}' to {Email}",
                    subject, toEmail);
                return;
            }

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;
                message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

                using var client = new SmtpClient();
                var secureOption = _settings.UseSsl
                    ? SecureSocketOptions.SslOnConnect
                    : SecureSocketOptions.StartTls;

                await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, secureOption);
                await client.AuthenticateAsync(_settings.Username, _settings.Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("[EmailService] Sent '{Subject}' to {Email}", subject, toEmail);
            }
            catch (Exception ex)
            {
                // Log but never throw — email failure must never block the purchase flow
                _logger.LogError(ex, "[EmailService] Failed to send '{Subject}' to {Email}", subject, toEmail);
            }
        }

        // ─────────────────────────────────────────────────────────────
        // Shared layout wrapper — CSS uses literal braces so we avoid
        // raw string interpolation conflicts by using string.Format or
        // standard concatenation for the style block.
        // ─────────────────────────────────────────────────────────────

        private static readonly string LayoutCss =
            "body{margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5}" +
            ".wrapper{max-width:600px;margin:0 auto;padding:32px 16px}" +
            ".hdr{background:linear-gradient(135deg,#FF6B35,#5D1725);border-radius:16px 16px 0 0;padding:32px 32px 24px;text-align:center}" +
            ".hdr h1{margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px}" +
            ".hdr p{margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.1em;text-transform:uppercase}" +
            ".body{background:#111;border:1px solid #222;border-top:none;border-radius:0 0 16px 16px;padding:32px}" +
            ".tbox{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:24px;margin:24px 0}" +
            ".lbl{font-size:10px;text-transform:uppercase;letter-spacing:.4em;color:#666;margin-bottom:4px}" +
            ".val{font-size:16px;font-weight:600;color:#fff;margin-bottom:16px}" +
            ".val.big{font-size:24px;color:#FF6B35;font-family:monospace;letter-spacing:.1em}" +
            ".divider{border:none;border-top:1px solid #222;margin:24px 0}" +
            ".badge{display:inline-block;background:linear-gradient(135deg,#FF6B35,#5D1725);color:#fff;" +
            "font-size:11px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;" +
            "padding:6px 16px;border-radius:999px;margin-bottom:20px}" +
            ".footer{text-align:center;margin-top:32px;font-size:11px;color:#444}" +
            ".footer a{color:#FF6B35;text-decoration:none}";

        private static string WrapInLayout(string title, string bodyContent)
        {
            return "<!DOCTYPE html><html lang=\"en\"><head>" +
                   "<meta charset=\"UTF-8\"/>" +
                   "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>" +
                   $"<title>{System.Net.WebUtility.HtmlEncode(title)}</title>" +
                   $"<style>{LayoutCss}</style></head><body>" +
                   "<div class=\"wrapper\">" +
                   "<div class=\"hdr\"><h1>KlubN</h1><p>Your night. Your music.</p></div>" +
                   $"<div class=\"body\">{bodyContent}</div>" +
                   "<div class=\"footer\">" +
                   "<p>&copy; KlubN &middot; <a href=\"https://klubn.com\">klubn.com</a></p>" +
                   "<p>Questions? <a href=\"mailto:support@klubn.com\">support@klubn.com</a></p>" +
                   "</div></div></body></html>";
        }

        // ─────────────────────────────────────────────────────────────
        // Template builders
        // ─────────────────────────────────────────────────────────────

        private static string BuildTicketConfirmationHtml(
            string toName, string ticketNumber, string eventTitle,
            DateTime eventDate, string venueName, string venueCity,
            decimal totalPrice, string qrCode)
        {
            Func<string, string> E = System.Net.WebUtility.HtmlEncode;
            var formattedDate = eventDate.ToString("dddd, d MMMM yyyy \u00b7 HH:mm");
            var cityPart = string.IsNullOrWhiteSpace(venueCity) ? "" : $", {E(venueCity)}";
            var qrPreview = qrCode.Length > 8 ? qrCode[..8] + "…" : qrCode;

            var body =
                "<span class=\"badge\">Booking Confirmed</span>" +
                $"<p style=\"font-size:18px;font-weight:700;color:#fff;margin:0 0 8px\">Hey {E(toName)}! &#127881;</p>" +
                "<p style=\"color:#aaa;margin:0 0 24px\">You're all set for the night. Here's everything you need:</p>" +
                "<div class=\"tbox\">" +
                "<div class=\"lbl\">Ticket Number</div><div class=\"val big\">" + E(ticketNumber) + "</div>" +
                "<div class=\"lbl\">Event</div><div class=\"val\">" + E(eventTitle) + "</div>" +
                "<div class=\"lbl\">Date &amp; Time</div><div class=\"val\">" + E(formattedDate) + "</div>" +
                "<div class=\"lbl\">Venue</div><div class=\"val\">" + E(venueName) + cityPart + "</div>" +
                "<hr class=\"divider\"/>" +
                "<div class=\"lbl\">Total Paid (incl. 12% VAT)</div>" +
                $"<div class=\"val\" style=\"color:#FF6B35\">&euro;{totalPrice:F2}</div>" +
                "</div>" +
                $"<p style=\"color:#888;font-size:13px;line-height:1.6\">Your QR code " +
                $"<strong style=\"color:#ccc;font-family:monospace\">{E(qrPreview)}</strong> " +
                "will be scanned at the door. Present this email or find your ticket in the KlubN app.</p>" +
                "<p style=\"color:#555;font-size:12px;margin-top:24px\">Doors open 30 minutes before the event. Valid photo ID required.</p>";

            return WrapInLayout($"Your ticket for {eventTitle}", body);
        }

        private static string BuildTransferConfirmationHtml(
            string toName, string ticketNumber, string eventTitle,
            DateTime eventDate, string venueName, string qrCode)
        {
            Func<string, string> E = System.Net.WebUtility.HtmlEncode;
            var formattedDate = eventDate.ToString("dddd, d MMMM yyyy \u00b7 HH:mm");

            var body =
                "<span class=\"badge\">Ticket Transferred</span>" +
                $"<p style=\"font-size:18px;font-weight:700;color:#fff;margin:0 0 8px\">Hey {E(toName)}! &#127903;&#65039;</p>" +
                "<p style=\"color:#aaa;margin:0 0 24px\">Someone sent you a ticket. You're going out!</p>" +
                "<div class=\"tbox\">" +
                "<div class=\"lbl\">Your New Ticket Number</div><div class=\"val big\">" + E(ticketNumber) + "</div>" +
                "<div class=\"lbl\">Event</div><div class=\"val\">" + E(eventTitle) + "</div>" +
                "<div class=\"lbl\">Date &amp; Time</div><div class=\"val\">" + E(formattedDate) + "</div>" +
                "<div class=\"lbl\">Venue</div><div class=\"val\">" + E(venueName) + "</div>" +
                "</div>" +
                "<p style=\"color:#888;font-size:13px;line-height:1.6\">" +
                "A fresh QR code has been generated for you. The previous owner's QR code is now invalid.</p>";

            return WrapInLayout($"Ticket transferred – {eventTitle}", body);
        }

        private static string BuildRefundConfirmationHtml(
            string toName, string ticketNumber, string eventTitle,
            decimal refundAmount, string transactionId)
        {
            Func<string, string> E = System.Net.WebUtility.HtmlEncode;

            var body =
                "<span class=\"badge\">Refund Processed</span>" +
                $"<p style=\"font-size:18px;font-weight:700;color:#fff;margin:0 0 8px\">Hey {E(toName)},</p>" +
                "<p style=\"color:#aaa;margin:0 0 24px\">Your refund has been processed. Please allow 3–5 business days for funds to appear.</p>" +
                "<div class=\"tbox\">" +
                "<div class=\"lbl\">Original Ticket</div><div class=\"val\">" + E(ticketNumber) + "</div>" +
                "<div class=\"lbl\">Event</div><div class=\"val\">" + E(eventTitle) + "</div>" +
                "<hr class=\"divider\"/>" +
                $"<div class=\"lbl\">Refund Amount</div><div class=\"val\" style=\"color:#FF6B35\">&euro;{refundAmount:F2}</div>" +
                "<div class=\"lbl\">Transaction Reference</div>" +
                "<div class=\"val\" style=\"font-family:monospace;font-size:13px;color:#999\">" + E(transactionId) + "</div>" +
                "</div>" +
                "<p style=\"color:#555;font-size:12px\">Questions? " +
                "<a href=\"mailto:support@klubn.com\" style=\"color:#FF6B35\">support@klubn.com</a></p>";

            return WrapInLayout($"Refund for {eventTitle}", body);
        }
    }
}
