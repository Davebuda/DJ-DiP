using DJDiP.Domain.Models;

namespace DJDiP.Application.DTO.ContactMessageDTO
{
    public class ContactMessageListDto
    {
        public List<ContactMessage> ContactMessage { get; set; } = new();
    }
}
