
using DJDiP.Application.DTO.ContactMessageDTO;
using DJDiP.Application.DTOs.ContactMessage;
namespace DJDiP.Application.Interfaces
{
public interface IContactMessageService
{
    Task<IEnumerable<ContactMessageListDto>> GetAllAsync();
    Task<ContactMessageReadDto> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(ContactMessageCreateDto dto);
    Task DeleteAsync(Guid id);
}


}