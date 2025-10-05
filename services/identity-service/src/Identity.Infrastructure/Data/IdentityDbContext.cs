using ECommerce.Common.Domain;
using ECommerce.Common.Infrastructure.Services;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Data;

public class IdentityDbContext : IdentityDbContext<ApplicationUser, Role, Guid, IdentityUserClaim<Guid>, IdentityUserRole<Guid>, IdentityUserLogin<Guid>, IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>
{
    private readonly DomainEventDispatcher? _dispatcher;

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options, DomainEventDispatcher? dispatcher = null)
        : base(options)
    {
        _dispatcher = dispatcher;
    }

    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure RolePermission composite key
        builder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        builder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId);

        builder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany()
            .HasForeignKey(rp => rp.PermissionId);

        // Configure concurrency tokens
        builder.Entity<ApplicationUser>()
            .Property(u => u.RowVersion)
            .IsRowVersion()
            .HasColumnType("bytea");

        builder.Entity<Role>()
            .Property(r => r.RowVersion)
            .IsRowVersion()
            .HasColumnType("bytea");
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);

        if (_dispatcher != null)
        {
            await _dispatcher.DispatchEventsAsync(this);
        }

        return result;
    }
}
