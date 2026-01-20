using System.ComponentModel.DataAnnotations;

namespace Identity.Application.Registration.DTOs;

public class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public required string Password { get; set; } = string.Empty;

    public required string FirstName { get; set; } = string.Empty;

    public required string LastName { get; set; } = string.Empty;

    [Required]
    public required string Role { get; set; } = string.Empty;
}
