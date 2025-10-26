using System.ComponentModel.DataAnnotations;

namespace Identity.Application.Login.DTOs;

public class LoginRequestDto
{
    [EmailAddress]
    public required string Email { get; set; } = string.Empty;

    [MinLength(6)]
    public required string Password { get; set; } = string.Empty;
}
