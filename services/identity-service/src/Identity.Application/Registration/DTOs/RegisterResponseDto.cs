using System.Text.Json.Serialization;

namespace Identity.Application.Registration.DTOs;

public class RegisterResponseDto
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Guid? TenantId { get; set; } // Included when SellerAdmin is created
}
