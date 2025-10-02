using Identity.Application.Registration.DTOs;
using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace Identity.UnitTests;

public class UserValidatorTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ILogger<UserValidator>> _loggerMock;
    private readonly UserValidator _validator;

    public UserValidatorTests()
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

        _loggerMock = new Mock<ILogger<UserValidator>>();
        _validator = new UserValidator(_userManagerMock.Object);
    }

    [Fact]
    public async Task ValidateAsync_ShouldReturnSuccess_WhenValidRequest()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe",
            Role = "Customer"
        };

        _userManagerMock.Setup(um => um.FindByEmailAsync(request.Email))
            .ReturnsAsync((ApplicationUser)null);

        // Act
        var result = await _validator.ValidateAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsValid);
        Assert.Null(result.ErrorMessage);
    }

    [Fact]
    public async Task ValidateAsync_ShouldReturnFailure_WhenUserAlreadyExists()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "password123",
            FirstName = "Jane",
            LastName = "Smith",
            Role = "Customer"
        };

        _userManagerMock.Setup(um => um.FindByEmailAsync(request.Email))
            .ReturnsAsync(new ApplicationUser { Email = request.Email });

        // Act
        var result = await _validator.ValidateAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.Equal("User with this email already exists.", result.ErrorMessage);
    }

    [Fact]
    public async Task ValidateAsync_ShouldReturnFailure_WhenEmailIsEmpty()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "",
            Password = "password123",
            FirstName = "Bob",
            LastName = "Wilson",
            Role = "Customer"
        };

        // Act
        var result = await _validator.ValidateAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.Equal("Email is required.", result.ErrorMessage);
    }

    [Fact]
    public async Task ValidateAsync_ShouldReturnFailure_WhenPasswordIsEmpty()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "",
            FirstName = "Alice",
            LastName = "Brown",
            Role = "Customer"
        };

        _userManagerMock.Setup(um => um.FindByEmailAsync(request.Email))
            .ReturnsAsync((ApplicationUser)null);

        // Act
        var result = await _validator.ValidateAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.Equal("Password is required.", result.ErrorMessage);
    }

    [Fact]
    public async Task ValidateAsync_ShouldReturnFailure_WhenRoleIsEmpty()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "Charlie",
            LastName = "Davis",
            Role = ""
        };

        _userManagerMock.Setup(um => um.FindByEmailAsync(request.Email))
            .ReturnsAsync((ApplicationUser)null);

        // Act
        var result = await _validator.ValidateAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.Equal("Role is required.", result.ErrorMessage);
    }
}
