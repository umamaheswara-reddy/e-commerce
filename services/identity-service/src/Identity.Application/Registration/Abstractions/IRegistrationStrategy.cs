using Identity.Application.Registration.DTOs;

namespace Identity.Application.Registration.Abstractions;

public interface IRegistrationStrategy
{
    Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request);
}
