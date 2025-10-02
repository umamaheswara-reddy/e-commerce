using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Identity.Infrastructure.Services;

public class UserFactory : IUserFactory
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserFactory(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserCreationResult> CreateUserAsync(string email, string password, Guid? tenantId, CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true, // For simplicity, auto-confirm
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, password);

        return new UserCreationResult
        {
            Succeeded = result.Succeeded,
            User = result.Succeeded ? user : null,
            Errors = result.Errors.Select(e => e.Description)
        };
    }
}
