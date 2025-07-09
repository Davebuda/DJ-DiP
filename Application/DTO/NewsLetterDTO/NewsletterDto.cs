namespace Application.DTO.NewsLetterDTO;

public class NewsletterDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime SubscribedAt { get; set; }
}
