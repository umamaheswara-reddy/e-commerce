using ECommerce.Common;
using ECommerce.Common.Abstractions;
using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Identity.Domain.Constants;
using Identity.Domain.Events;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration.Strategies;

public class SellerAdminRegistrationStrategy(
    IUserValidator userValidator,
    IUserFactory userFactory,
    IRoleAssigner roleAssigner,
    ITokenGenerator tokenGenerator,
    ILogger<SellerAdminRegistrationStrategy> logger) : IRegistrationStrategy
{
    public async Task<Result<RegisterResponseDto>> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input using IUserValidator
            var validation = await userValidator.ValidateAsync(request, cancellationToken);
            if (!validation.IsValid)
                return Result<RegisterResponseDto>.Failure(validation.ErrorMessage!, ErrorCodes.ValidationFailed);

            // Validate role-tenant rules: SellerAdmin must generate new TenantId
            if (request.Role != Roles.SellerAdmin)
            {
                return Result<RegisterResponseDto>.Failure("Invalid role for SellerAdmin registration strategy.", ErrorCodes.UserCreationFailed);
            }

            // Generate tenant ID for SellerAdmin
            var tenantId = Guid.NewGuid();

            // Create user via IUserFactory
            var userCreation = await userFactory.CreateUserAsync(request.Email, request.Password, tenantId, cancellationToken);
            if (!userCreation.Succeeded)
                return Result<RegisterResponseDto>.Failure(string.Join(", ", userCreation.Errors), ErrorCodes.UserCreationFailed);

            var user = userCreation.User!;

            // Assign role via IRoleAssigner
            var roleAssignment = await roleAssigner.AssignRoleAsync(user, request.Role, cancellationToken);
            if (!roleAssignment.Succeeded)
                return Result<RegisterResponseDto>.Failure(string.Join(", ", roleAssignment.Errors), ErrorCodes.RoleAssignmentFailed);

            // Raise domain event
            user.AddDomainEvent(new UserRegisteredDomainEvent(user.Id, user.Email!, request.Role));

            // Generate token via ITokenGenerator
            var token = tokenGenerator.GenerateToken(user, request.Role);

            var response = new RegisterResponseDto
            {
                UserId = user.Id,
                TenantId = tenantId,
                Token = token
            };

            logger.LogInformation("SellerAdmin registered successfully: {Email} with tenant {TenantId}", request.Email, tenantId);

            return Result<RegisterResponseDto>.Success(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during SellerAdmin registration for {Email}", request.Email);
            return Result<RegisterResponseDto>.Failure("An error occurred during registration.", ErrorCodes.InternalError);
        }
    }
}
