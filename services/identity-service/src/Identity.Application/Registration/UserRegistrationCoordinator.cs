using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration;

public class UserRegistrationCoordinator(
    IRegistrationStrategyFactory strategyFactory,
    ILogger<UserRegistrationCoordinator> logger) : IRegistrationService
{
    private readonly IRegistrationStrategyFactory _strategyFactory = strategyFactory;
    private readonly ILogger<UserRegistrationCoordinator> _logger = logger;

    public async Task<RegisterResponseDto> RegisterUserAsync(RegisterRequestDto request)
    {
        try
        {
            _logger.LogInformation("Starting user registration for {Email} with role {Role}", request.Email, request.Role);

            // Get the appropriate strategy based on the role
            var strategy = _strategyFactory.GetStrategy(request.Role);

            // Delegate the registration to the specific strategy
            var result = await strategy.RegisterAsync(request);

            if (result.Success)
            {
                _logger.LogInformation("User registration completed successfully for {Email}", request.Email);
            }
            else
            {
                _logger.LogWarning("User registration failed for {Email}: {Message}", request.Email, result.Message);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration coordination for {Email}", request.Email);
            return new RegisterResponseDto
            {
                Success = false,
                Message = "An error occurred during registration."
            };
        }
    }
}
