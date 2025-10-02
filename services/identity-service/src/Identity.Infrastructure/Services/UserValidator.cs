using Identity.Application.Registration.DTOs;
using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Identity.Infrastructure.Services;

public class UserValidator : IUserValidator
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserValidator(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<ValidationResult> ValidateAsync(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        // Check if user already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return ValidationResult.Failure("User with this email already exists.");
        }

        // Additional validations can be added here
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ValidationResult.Failure("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return ValidationResult.Failure("Password is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            return ValidationResult.Failure("Role is required.");
        }

        // Validate role-specific rules
        // TenantId is generated in backend for SellerAdmin, not provided by client
        // Customer has no tenant association

        return ValidationResult.Success();
    }
}
