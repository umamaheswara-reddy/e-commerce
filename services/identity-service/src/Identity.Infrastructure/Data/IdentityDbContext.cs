using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Identity.Domain.Entities;
using Identity.Domain;

namespace Identity.Infrastructure.Data;

public class IdentityDbContext : IdentityDbContext<ApplicationUser, Role, Guid, IdentityUserClaim<Guid>, IdentityUserRole<Guid>, IdentityUserLogin<Guid>, IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options)
        : base(options) { }

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

    public IEnumerable<IDomainEvent> GetDomainEvents<TEntity>() where TEntity : class
    {
        return ChangeTracker.Entries<TEntity>()
            .Select(e => e.Entity)
            .OfType<IDomainEventSource>()
            .SelectMany(e => e.DomainEvents);
    }

    public void ClearDomainEvents<TEntity>() where TEntity : class
    {
        foreach (var entry in ChangeTracker.Entries<TEntity>())
        {
            if (entry.Entity is IDomainEventSource entityWithEvents)
            {
                entityWithEvents.ClearDomainEvents();
            }
        }
    }
}
