using ECommerce.Common.Abstractions;
using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Identity.Domain.Constants;
using Identity.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration.Strategies;

public class CustomerRegistrationStrategy(
    IUserValidator userValidator,
    IUserFactory userFactory,
    IRoleAssigner roleAssigner,
    ITokenGenerator tokenGenerator,
    IMediator mediator,
    ILogger<CustomerRegistrationStrategy> logger) : IRegistrationStrategy
{
    public async Task<Result<RegisterResponseDto>> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input using IUserValidator
            var validationResult = await userValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                return Result<RegisterResponseDto>.Failure(validationResult.ErrorMessage!, ErrorCodes.ValidationFailed);
            }

            // Validate that Customer has no tenant association
            if (request.Role != Roles.Customer)
            {
                return Result<RegisterResponseDto>.Failure("Invalid role for Customer registration strategy.", ErrorCodes.ValidationFailed);
            }

            // Create user via IUserFactory (no tenant for Customer)
            var userCreationResult = await userFactory.CreateUserAsync(request.Email, request.Password, null, cancellationToken);
            if (!userCreationResult.Succeeded)
            {
                return Result<RegisterResponseDto>.Failure(string.Join(", ", userCreationResult.Errors), ErrorCodes.ValidationFailed);
            }

            var user = userCreationResult.User!;

            // Assign role via IRoleAssigner
            var roleAssignmentResult = await roleAssigner.AssignRoleAsync(user, request.Role, cancellationToken);
            if (!roleAssignmentResult.Succeeded)
            {
                return Result<RegisterResponseDto>.Failure(string.Join(", ", roleAssignmentResult.Errors), ErrorCodes.ValidationFailed);
            }

            // Raise domain event
            await mediator.Publish(new UserRegisteredDomainEvent(user.Id, user.Email!, request.Role), cancellationToken);

            // Generate token via ITokenGenerator
            var token = tokenGenerator.GenerateToken(user, request.Role);

            logger.LogInformation("Customer registered successfully: {Email}", request.Email);

            return Result<RegisterResponseDto>.Success(new RegisterResponseDto
            {
                UserId = user.Id,
                Token = token,
                TenantId = null
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during Customer registration for {Email}", request.Email);
            return Result<RegisterResponseDto>.Failure("An error occurred during registration.", ErrorCodes.ValidationFailed);
        }
    }
}
