using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Identity.Infrastructure.Services;

public class DataSeeder
{
    private readonly IdentityDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        IdentityDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<Role> roleManager,
        IConfiguration configuration,
        ILogger<DataSeeder> logger)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await SeedRolesAsync();
        await EnsureSuperAdminExistsAsync();
    }

    private async Task SeedRolesAsync()
    {
        var roles = new[]
        {
            new { Name = "SuperAdmin", Description = "Global system administrator with full access" },
            new { Name = "SellerAdmin", Description = "Tenant-specific administrator for sellers" },
            new { Name = "Customer", Description = "Regular customer user" }
        };

        foreach (var roleInfo in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleInfo.Name))
            {
                var role = new Role
                {
                    Name = roleInfo.Name,
                    NormalizedName = roleInfo.Name.ToUpper(),
                    Description = roleInfo.Description,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _roleManager.CreateAsync(role);
                if (result.Succeeded)
                {
                    _logger.LogInformation("Role '{Role}' seeded successfully", roleInfo.Name);
                }
                else
                {
                    _logger.LogError("Failed to seed role '{Role}': {Errors}",
                        roleInfo.Name, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private async Task EnsureSuperAdminExistsAsync()
    {
        var superAdminRole = await _roleManager.FindByNameAsync("SuperAdmin");
        if (superAdminRole == null)
        {
            _logger.LogError("SuperAdmin role not found. Cannot create default SuperAdmin.");
            return;
        }

        // Check if any SuperAdmin exists
        var superAdmins = await _userManager.GetUsersInRoleAsync("SuperAdmin");
        if (superAdmins.Any())
        {
            _logger.LogInformation("SuperAdmin already exists. Skipping default SuperAdmin creation.");
            return;
        }

        // Create default SuperAdmin from configuration
        var defaultSuperAdminEmail = _configuration["DefaultSuperAdmin:Email"];
        var defaultSuperAdminPassword = _configuration["DefaultSuperAdmin:Password"];

        if (string.IsNullOrEmpty(defaultSuperAdminEmail) || string.IsNullOrEmpty(defaultSuperAdminPassword))
        {
            _logger.LogWarning("Default SuperAdmin credentials not configured. Skipping default SuperAdmin creation.");
            return;
        }

        var superAdmin = new ApplicationUser
        {
            UserName = defaultSuperAdminEmail,
            Email = defaultSuperAdminEmail,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(superAdmin, defaultSuperAdminPassword);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(superAdmin, "SuperAdmin");
            _logger.LogInformation("Default SuperAdmin created successfully: {Email}", defaultSuperAdminEmail);
        }
        else
        {
            _logger.LogError("Failed to create default SuperAdmin: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}
