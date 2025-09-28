using Identity.Application.Registration.DTOs;

namespace Identity.Application.Registration.Abstractions;

public interface IRegistrationService
{
    Task<RegisterResponseDto> RegisterUserAsync(RegisterRequestDto request);
}
