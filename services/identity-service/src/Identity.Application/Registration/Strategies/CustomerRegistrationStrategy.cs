using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Identity.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Registration.Strategies;

public class CustomerRegistrationStrategy : IRegistrationStrategy
{
    private readonly IUserValidator _userValidator;
    private readonly IUserFactory _userFactory;
    private readonly IRoleAssigner _roleAssigner;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IEventPublisher _eventPublisher;
    private readonly ILogger<CustomerRegistrationStrategy> _logger;

    public CustomerRegistrationStrategy(
        IUserValidator userValidator,
        IUserFactory userFactory,
        IRoleAssigner roleAssigner,
        ITokenGenerator tokenGenerator,
        IEventPublisher eventPublisher,
        ILogger<CustomerRegistrationStrategy> logger)
    {
        _userValidator = userValidator;
        _userFactory = userFactory;
        _roleAssigner = roleAssigner;
        _tokenGenerator = tokenGenerator;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        try
        {
            // Validate input using IUserValidator
            var validationResult = await _userValidator.ValidateAsync(request);
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
            var userCreationResult = await _userFactory.CreateUserAsync(request.Email, request.Password, null);
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
            var roleAssignmentResult = await _roleAssigner.AssignRoleAsync(user, request.Role);
            if (!roleAssignmentResult.Succeeded)
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", roleAssignmentResult.Errors)
                };
            }

            // Generate token via ITokenGenerator
            var token = _tokenGenerator.GenerateToken(user, request.Role);

            // Publish event via IEventPublisher
            await _eventPublisher.PublishAccountRegisteredEventAsync(user, request.Role);

            _logger.LogInformation("Customer registered successfully: {Email}", request.Email);

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
            _logger.LogError(ex, "Error during Customer registration for {Email}", request.Email);
            return new RegisterResponseDto
            {
                Success = false,
                Message = "An error occurred during registration."
            };
        }
    }
}
