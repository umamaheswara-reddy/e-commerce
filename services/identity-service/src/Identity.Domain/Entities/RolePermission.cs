namespace Identity.Domain.Entities;

public class RolePermission
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
