using Identity.Domain.Entities;

namespace Identity.Application.Abstractions;

public interface IRoleAssigner
{
    Task<RoleAssignmentResult> AssignRoleAsync(ApplicationUser user, string roleName, CancellationToken cancellationToken);
}

public class RoleAssignmentResult
{
    public bool Succeeded { get; set; }
    public IEnumerable<string> Errors { get; set; } = new List<string>();
}
