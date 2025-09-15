public interface INewsletterService
{
    Task<IEnumerable<NewsletterDto>> GetAllAsync();
    Task<NewsletterDto?> GetByIdAsync(Guid id);
    Task<NewsletterDto> SubscribeAsync(CreateNewsletterDto dto);
    Task<bool> UnsubscribeAsync(Guid id);
}
