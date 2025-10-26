using Identity.Domain.Entities;

namespace Identity.Application.Login.DTOs;

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public Guid? TenantId { get; set; }
}
