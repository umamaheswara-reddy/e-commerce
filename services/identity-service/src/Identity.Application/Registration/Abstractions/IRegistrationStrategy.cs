using Identity.Application.Abstractions;
using Identity.Application.Registration.DTOs;

namespace Identity.Application.Registration.Abstractions;

public interface IRegistrationStrategy
{
    Task<Result<RegisterResponseDto>> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken);
}
