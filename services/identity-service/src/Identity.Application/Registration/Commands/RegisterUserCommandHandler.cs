using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Identity.Domain.Constants;
using Identity.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration.Commands;

public class RegisterUserCommandHandler(
    IRegistrationStrategyFactory strategyFactory,
    ILogger<RegisterUserCommandHandler> logger) : IRequestHandler<RegisterUserCommand, Result<RegisterResponseDto>>
{
    public async Task<Result<RegisterResponseDto>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get the appropriate strategy based on the role
            var strategy = strategyFactory.GetStrategy(request.Role);

            // Create registration request
            var registerRequest = new RegisterRequestDto
            {
                Email = request.Email,
                Password = request.Password,
                Role = request.Role,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            // Delegate registration to the strategy
            return await strategy.RegisterAsync(registerRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during registration for {Email}", request.Email);
            return Result<RegisterResponseDto>.Failure("An error occurred during registration.", ErrorCodes.InternalError);
        }
    }
}
