using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration.Strategies;

public class SellerAdminRegistrationStrategy(
    IUserValidator userValidator,
    IUserFactory userFactory,
    IRoleAssigner roleAssigner,
    ITokenGenerator tokenGenerator,
    IEventPublisher eventPublisher,
    ILogger<SellerAdminRegistrationStrategy> logger) : IRegistrationStrategy
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

            // Validate role-tenant rules: SellerAdmin must generate new TenantId
            if (request.Role != "SellerAdmin")
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = "Invalid role for SellerAdmin registration strategy."
                };
            }

            // Generate tenant ID for SellerAdmin
            var tenantId = Guid.NewGuid();

            // Create user via IUserFactory
            var userCreationResult = await userFactory.CreateUserAsync(request.Email, request.Password, tenantId);
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

            logger.LogInformation("SellerAdmin registered successfully: {Email} with tenant {TenantId}", request.Email, tenantId);

            return new RegisterResponseDto
            {
                Success = true,
                Message = "Registration successful.",
                UserId = user.Id,
                Token = token,
                TenantId = tenantId
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during SellerAdmin registration for {Email}", request.Email);
            return new RegisterResponseDto
            {
                Success = false,
                Message = "An error occurred during registration."
            };
        }
    }
}
