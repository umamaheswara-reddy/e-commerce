using Identity.Application.Registration.Abstractions;
using MediatR;

namespace Identity.Application.Registration.Commands;

public class RegisterUserCommandHandler(IRegistrationStrategyFactory strategyFactory) : IRequestHandler<RegisterUserCommand, Guid>
{
    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Moved from UserRegistrationCoordinator: Get the appropriate strategy based on the role
        var strategy = strategyFactory.GetStrategy(request.Role);

        // Delegate the registration to the specific strategy (moved from UserRegistrationCoordinator)
        var result = await strategy.RegisterAsync(new Registration.DTOs.RegisterRequestDto
        {
            Email = request.Email,
            Password = request.Password,
            Role = request.Role,
            FirstName = request.FirstName,
            LastName = request.LastName
        });

        if (!result.Success)
        {
            throw new InvalidOperationException(result.Message);
        }

        return result.UserId;
    }
}
