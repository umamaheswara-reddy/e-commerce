using Microsoft.AspNetCore.Identity;

namespace Identity.Domain.Entities;

public class Role : IdentityRole<Guid>
{
    public string Description { get; set; } = string.Empty;
    public Guid? TenantId { get; set; } // For multi-tenancy
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>(); // For optimistic concurrency

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
