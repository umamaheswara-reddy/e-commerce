using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace Identity.UnitTests;

public class RoleAssignerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<RoleManager<Role>> _roleManagerMock;
    private readonly Mock<ILogger<RoleAssigner>> _loggerMock;
    private readonly RoleAssigner _assigner;

    public RoleAssignerTests()
    {
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            new Mock<IUserStore<ApplicationUser>>().Object,
            new Mock<IOptions<IdentityOptions>>().Object,
            new PasswordHasher<ApplicationUser>(),
            new List<IUserValidator<ApplicationUser>>(),
            new List<IPasswordValidator<ApplicationUser>>(),
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            new ServiceCollection().BuildServiceProvider(),
            new Mock<ILogger<UserManager<ApplicationUser>>>().Object);

        _roleManagerMock = new Mock<RoleManager<Role>>(
            new Mock<IRoleStore<Role>>().Object,
            new List<IRoleValidator<Role>>(),
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            new Mock<ILogger<RoleManager<Role>>>().Object);

        _loggerMock = new Mock<ILogger<RoleAssigner>>();
        _assigner = new RoleAssigner(_userManagerMock.Object, _roleManagerMock.Object);
    }

    [Fact]
    public async Task AssignRoleAsync_ShouldAssignRoleSuccessfully_WhenRoleExists()
    {
        // Arrange
        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "test@example.com" };
        var roleName = "Customer";
        var role = new Role { Name = roleName };

        _roleManagerMock.Setup(rm => rm.FindByNameAsync(roleName))
            .ReturnsAsync(role);

        _userManagerMock.Setup(um => um.AddToRoleAsync(user, roleName))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _assigner.AssignRoleAsync(user, roleName);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Empty(result.Errors);

        _roleManagerMock.Verify(rm => rm.FindByNameAsync(roleName), Times.Once);
        _userManagerMock.Verify(um => um.AddToRoleAsync(user, roleName), Times.Once);
    }

    [Fact]
    public async Task AssignRoleAsync_ShouldReturnFailure_WhenRoleDoesNotExist()
    {
        // Arrange
        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "test@example.com" };
        var roleName = "NonExistentRole";

        _roleManagerMock.Setup(rm => rm.FindByNameAsync(roleName))
            .ReturnsAsync((Role)null);

        // Act
        var result = await _assigner.AssignRoleAsync(user, roleName);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Single(result.Errors);
        Assert.Equal($"Role '{roleName}' not found.", result.Errors.First());

        _roleManagerMock.Verify(rm => rm.FindByNameAsync(roleName), Times.Once);
        _userManagerMock.Verify(um => um.AddToRoleAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task AssignRoleAsync_ShouldReturnFailure_WhenRoleAssignmentFails()
    {
        // Arrange
        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "test@example.com" };
        var roleName = "Customer";
        var role = new Role { Name = roleName };

        var identityErrors = new[]
        {
            new IdentityError { Code = "UserAlreadyInRole", Description = "User is already in role" },
            new IdentityError { Code = "RoleNotFound", Description = "Role not found" }
        };

        _roleManagerMock.Setup(rm => rm.FindByNameAsync(roleName))
            .ReturnsAsync(role);

        _userManagerMock.Setup(um => um.AddToRoleAsync(user, roleName))
            .ReturnsAsync(IdentityResult.Failed(identityErrors));

        // Act
        var result = await _assigner.AssignRoleAsync(user, roleName);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal(2, result.Errors.Count());
        Assert.Contains("User is already in role", result.Errors);
        Assert.Contains("Role not found", result.Errors);

        _roleManagerMock.Verify(rm => rm.FindByNameAsync(roleName), Times.Once);
        _userManagerMock.Verify(um => um.AddToRoleAsync(user, roleName), Times.Once);
    }
}
