using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration.Strategies;

public class CustomerRegistrationStrategy(
    IUserValidator userValidator,
    IUserFactory userFactory,
    IRoleAssigner roleAssigner,
    ITokenGenerator tokenGenerator,
    IEventPublisher eventPublisher,
    ILogger<CustomerRegistrationStrategy> logger) : IRegistrationStrategy
{
    public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        try
        {
            // Validate input using IUserValidator
            var validationResult = await userValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = validationResult.ErrorMessage!
                };
            }

            // Validate that Customer has no tenant association
            if (request.Role != "Customer")
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = "Invalid role for Customer registration strategy."
                };
            }

            // Create user via IUserFactory (no tenant for Customer)
            var userCreationResult = await userFactory.CreateUserAsync(request.Email, request.Password, null);
            if (!userCreationResult.Succeeded)
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", userCreationResult.Errors)
                };
            }

            var user = userCreationResult.User!;

            // Assign role via IRoleAssigner
            var roleAssignmentResult = await roleAssigner.AssignRoleAsync(user, request.Role);
            if (!roleAssignmentResult.Succeeded)
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", roleAssignmentResult.Errors)
                };
            }

            // Generate token via ITokenGenerator
            var token = tokenGenerator.GenerateToken(user, request.Role);

            // Publish event via IEventPublisher
            await eventPublisher.PublishAccountRegisteredEventAsync(user, request.Role);

            logger.LogInformation("Customer registered successfully: {Email}", request.Email);

            return new RegisterResponseDto
            {
                Success = true,
                Message = "Registration successful.",
                UserId = user.Id,
                Token = token,
                TenantId = null
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during Customer registration for {Email}", request.Email);
            return new RegisterResponseDto
            {
                Success = false,
                Message = "An error occurred during registration."
            };
        }
    }
}
