using DJDiP.Application.DTO.PaymentDTO;
using DJDiP.Application.DTO.TicketDTO;
using DJDiP.Application.Interfaces;
using DJDiP.Application.Options;
using DJDiP.Domain.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;

namespace DJDiP.Application.Services
{
    public class StripePaymentService : IStripePaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITicketService _ticketService;
        private readonly StripeSettings _stripeSettings;
        private readonly ILogger<StripePaymentService> _logger;
        private const string NORWEGIAN_CURRENCY = "nok";
        private const decimal NORWEGIAN_EVENT_VAT_RATE = 0.12m;

        public StripePaymentService(
            IUnitOfWork unitOfWork,
            ITicketService ticketService,
            IOptions<StripeSettings> stripeSettings,
            ILogger<StripePaymentService> logger)
        {
            _unitOfWork = unitOfWork;
            _ticketService = ticketService;
            _stripeSettings = stripeSettings.Value;
            _logger = logger;

            // Initialize Stripe API key
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<PaymentIntentDto> CreateEventPaymentIntentAsync(CreatePaymentIntentDto dto)
        {
            try
            {
                // Validate event exists
                var ev = await _unitOfWork.Events.GetByIdAsync(dto.EventId);
                if (ev == null)
                {
                    throw new ArgumentException($"Event with ID {dto.EventId} not found");
                }

                // Calculate Norwegian VAT-inclusive price
                var basePrice = ev.Price / (1 + NORWEGIAN_EVENT_VAT_RATE);
                var vatAmount = ev.Price - basePrice;
                var totalPrice = ev.Price;

                // Convert to øre (smallest currency unit - 1 NOK = 100 øre)
                var amountInOre = (long)(totalPrice * 100);

                // Create idempotency key to prevent duplicate payments
                var idempotencyKey = $"{dto.UserId}_{dto.EventId}_{DateTime.UtcNow.Ticks}";

                // Create Stripe PaymentIntent
                var options = new PaymentIntentCreateOptions
                {
                    Amount = amountInOre,
                    Currency = NORWEGIAN_CURRENCY,
                    Description = $"Ticket for {ev.Title}",
                    ReceiptEmail = dto.Email,
                    Metadata = new Dictionary<string, string>
                    {
                        { "event_id", dto.EventId.ToString() },
                        { "user_id", dto.UserId },
                        { "event_title", ev.Title },
                        { "base_price_nok", Math.Round(basePrice, 2).ToString() },
                        { "vat_amount_nok", Math.Round(vatAmount, 2).ToString() },
                        { "vat_rate", "12%" }
                    },
                    // Automatic payment methods for Norwegian market
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true
                    }
                };

                var requestOptions = new RequestOptions
                {
                    IdempotencyKey = idempotencyKey
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options, requestOptions);

                _logger.LogInformation(
                    "Created PaymentIntent {PaymentIntentId} for event {EventId}, amount {Amount} øre ({AmountNOK} NOK)",
                    paymentIntent.Id,
                    dto.EventId,
                    amountInOre,
                    totalPrice
                );

                return new PaymentIntentDto
                {
                    PaymentIntentId = paymentIntent.Id,
                    ClientSecret = paymentIntent.ClientSecret,
                    Amount = amountInOre,
                    Currency = NORWEGIAN_CURRENCY
                };
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe error creating PaymentIntent for event {EventId}", dto.EventId);
                throw new Exception($"Payment system error: {ex.StripeError?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PaymentIntent for event {EventId}", dto.EventId);
                throw;
            }
        }

        public async Task<TicketDto> ConfirmStripePaymentAndIssueTicketAsync(ConfirmPaymentDto dto)
        {
            try
            {
                // Retrieve and verify PaymentIntent from Stripe
                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(dto.PaymentIntentId);

                if (paymentIntent == null)
                {
                    throw new ArgumentException($"PaymentIntent {dto.PaymentIntentId} not found");
                }

                // Security: Verify payment succeeded
                if (paymentIntent.Status != "succeeded")
                {
                    throw new InvalidOperationException($"Payment not successful. Status: {paymentIntent.Status}");
                }

                // Security: Verify metadata matches
                if (!paymentIntent.Metadata.TryGetValue("event_id", out var eventIdStr) ||
                    eventIdStr != dto.EventId.ToString())
                {
                    throw new SecurityException("PaymentIntent event mismatch - potential fraud attempt");
                }

                if (!paymentIntent.Metadata.TryGetValue("user_id", out var userId) ||
                    userId != dto.UserId)
                {
                    throw new SecurityException("PaymentIntent user mismatch - potential fraud attempt");
                }

                // Verify event still exists
                var ev = await _unitOfWork.Events.GetByIdAsync(dto.EventId);
                if (ev == null)
                {
                    throw new ArgumentException($"Event {dto.EventId} not found");
                }

                // Create ticket with Norwegian compliance
                // Note: TicketService handles Norwegian VAT calculation internally (12% for events)
                var createTicketDto = new CreateTicketDto
                {
                    EventId = dto.EventId,
                    UserId = dto.UserId,
                    Email = dto.Email,
                    TermsAccepted = true // Payment completion implies terms acceptance
                };

                var ticket = await _ticketService.CreateTicketAsync(createTicketDto);

                _logger.LogInformation(
                    "Issued ticket {TicketId} for PaymentIntent {PaymentIntentId}, event {EventId}, user {UserId}",
                    ticket.Id,
                    dto.PaymentIntentId,
                    dto.EventId,
                    dto.UserId
                );

                return ticket!;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe error confirming payment {PaymentIntentId}", dto.PaymentIntentId);
                throw new Exception($"Payment verification error: {ex.StripeError?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming payment {PaymentIntentId}", dto.PaymentIntentId);
                throw;
            }
        }

        public async Task<bool> ValidateWebhookSignatureAsync(string payload, string signature)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    payload,
                    signature,
                    _stripeSettings.WebhookSecret
                );

                _logger.LogInformation("Validated webhook event {EventType}", stripeEvent.Type);
                return await Task.FromResult(true);
            }
            catch (StripeException ex)
            {
                _logger.LogWarning(ex, "Invalid webhook signature");
                return await Task.FromResult(false);
            }
        }
    }

    public class SecurityException : Exception
    {
        public SecurityException(string message) : base(message) { }
    }
}
