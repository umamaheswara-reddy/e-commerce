using ECommerce.Common;
using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Identity.Infrastructure.Services;

public class RoleAssigner : IRoleAssigner
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<Role> _roleManager;

    public RoleAssigner(UserManager<ApplicationUser> userManager, RoleManager<Role> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<RoleAssignmentResult> AssignRoleAsync(ApplicationUser user, string roleName, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role == null)
        {
            return new RoleAssignmentResult
            {
                Succeeded = false,
                Errors = new[] { $"Role '{roleName}' not found." }
            };
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);

        return new RoleAssignmentResult
        {
            Succeeded = result.Succeeded,
            Errors = result.Errors.Select(e => e.Description)
        };
    }
}
