using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DJDiP.Application.DTO.Auth;
using DJDiP.Application.Interfaces;
using DJDiP.Application.Options;
using DJDiP.Domain.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DJDiP.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly AuthSettings _settings;

        public AuthService(IUnitOfWork unitOfWork, IOptions<AuthSettings> options)
        {
            _unitOfWork = unitOfWork;
            _settings = options.Value;
        }

        public async Task<AuthPayload> RegisterAsync(string fullName, string email, string password)
        {
            var existingUser = await _unitOfWork.Users.GetByEmailAsync(email);
            if (existingUser != null)
            {
                throw new InvalidOperationException($"User with email {email} already exists.");
            }

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                FullName = fullName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Provider = "Local",
                Role = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return GenerateAuthPayload(user);
        }

        public async Task<AuthPayload> LoginAsync(string email, string password)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
            {
                throw new InvalidOperationException("Invalid credentials.");
            }

            var passwordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            if (!passwordValid)
            {
                throw new InvalidOperationException("Invalid credentials.");
            }

            return GenerateAuthPayload(user);
        }

        private AuthPayload GenerateAuthPayload(ApplicationUser user)
        {
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new("userId", user.Id), // Add userId claim for GraphQL mutations
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Name, user.FullName),
                new(ClaimTypes.Role, MapRole(user.Role))
            };

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_settings.AccessTokenMinutes),
                signingCredentials: credentials);

            var handler = new JwtSecurityTokenHandler();

            return new AuthPayload
            {
                AccessToken = handler.WriteToken(token),
                RefreshToken = Guid.NewGuid().ToString("N"),
                User = new AuthUserPayload
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = MapRole(user.Role)
                }
            };
        }

        private static string MapRole(int role) => role switch
        {
            2 => "Admin",
            1 => "DJ",
            _ => "User"
        };
    }
}
