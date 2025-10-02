using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace Identity.UnitTests;

public class UserFactoryTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ILogger<UserFactory>> _loggerMock;
    private readonly UserFactory _factory;

    public UserFactoryTests()
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

        _loggerMock = new Mock<ILogger<UserFactory>>();
        _factory = new UserFactory(_userManagerMock.Object);
    }

    [Fact]
    public async Task CreateUserAsync_ShouldCreateUserWithTenantId_WhenTenantIdProvided()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";
        var tenantId = Guid.NewGuid();

        _userManagerMock.Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), password))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser, string>((user, pwd) =>
            {
                user.Id = Guid.NewGuid();
            });

        // Act
        var result = await _factory.CreateUserAsync(email, password, tenantId, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.User);
        Assert.Equal(email, result.User!.UserName);
        Assert.Equal(email, result.User!.Email);
        Assert.Equal(tenantId, result.User!.TenantId);
        Assert.True(result.User!.EmailConfirmed);
        Assert.NotEqual(default, result.User!.CreatedAt);

        _userManagerMock.Verify(um => um.CreateAsync(
            It.Is<ApplicationUser>(u =>
                u.UserName == email &&
                u.Email == email &&
                u.TenantId == tenantId &&
                u.EmailConfirmed == true),
            password), Times.Once);
    }

    [Fact]
    public async Task CreateUserAsync_ShouldCreateUserWithoutTenantId_WhenTenantIdIsNull()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";

        _userManagerMock.Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), password))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser, string>((user, pwd) =>
            {
                user.Id = Guid.NewGuid();
            });

        // Act
        var result = await _factory.CreateUserAsync(email, password, null, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.User);
        Assert.Equal(email, result.User!.UserName);
        Assert.Equal(email, result.User!.Email);
        Assert.Null(result.User!.TenantId);
        Assert.True(result.User!.EmailConfirmed);

        _userManagerMock.Verify(um => um.CreateAsync(
            It.Is<ApplicationUser>(u =>
                u.UserName == email &&
                u.Email == email &&
                u.TenantId == null &&
                u.EmailConfirmed == true),
            password), Times.Once);
    }

    [Fact]
    public async Task CreateUserAsync_ShouldReturnFailure_WhenUserCreationFails()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";
        var tenantId = Guid.NewGuid();

        var identityErrors = new[]
        {
            new IdentityError { Code = "PasswordTooWeak", Description = "Password is too weak" },
            new IdentityError { Code = "DuplicateEmail", Description = "Email already exists" }
        };

        _userManagerMock.Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), password))
            .ReturnsAsync(IdentityResult.Failed(identityErrors));

        // Act
        var result = await _factory.CreateUserAsync(email, password, tenantId, CancellationToken.None);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Null(result.User);
        Assert.Equal(2, result.Errors.Count());
        Assert.Contains("Password is too weak", result.Errors);
        Assert.Contains("Email already exists", result.Errors);
    }
}
