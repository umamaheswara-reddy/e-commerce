using System.ComponentModel.DataAnnotations;

namespace Identity.Application.Registration.DTOs;

public class RegisterRequestDto
{
    [EmailAddress]
    public required string Email { get; set; } = string.Empty;

    [MinLength(6)]
    public required string Password { get; set; } = string.Empty;

    public required string FirstName { get; set; } = string.Empty;

    public required string LastName { get; set; } = string.Empty;

    public required string Role { get; set; } = string.Empty;

    // TenantId is now generated in backend for SellerAdmin, not provided by client
}
