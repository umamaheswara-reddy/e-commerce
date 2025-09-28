namespace Identity.Application.Registration.DTOs;

public class RegisterResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public Guid? TenantId { get; set; } // Included when SellerAdmin is created
}
