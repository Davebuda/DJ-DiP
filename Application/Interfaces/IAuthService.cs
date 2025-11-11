using DJDiP.Application.DTO.Auth;

namespace DJDiP.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthPayload> RegisterAsync(string fullName, string email, string password);
        Task<AuthPayload> LoginAsync(string email, string password);
    }
}
