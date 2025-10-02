using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Identity.Application.Registration.Strategies;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;

namespace Identity.UnitTests;

public class SellerAdminRegistrationStrategyTests
{
    private readonly Mock<IUserValidator> _userValidatorMock;
    private readonly Mock<IUserFactory> _userFactoryMock;
    private readonly Mock<IRoleAssigner> _roleAssignerMock;
    private readonly Mock<ITokenGenerator> _tokenGeneratorMock;
    private readonly Mock<ILogger<SellerAdminRegistrationStrategy>> _loggerMock;
    private readonly SellerAdminRegistrationStrategy _strategy;

    public SellerAdminRegistrationStrategyTests()
    {
        _userValidatorMock = new Mock<IUserValidator>();
        _userFactoryMock = new Mock<IUserFactory>();
        _roleAssignerMock = new Mock<IRoleAssigner>();
        _tokenGeneratorMock = new Mock<ITokenGenerator>();
        _loggerMock = new Mock<ILogger<SellerAdminRegistrationStrategy>>();

        _strategy = new SellerAdminRegistrationStrategy(
            _userValidatorMock.Object,
            _userFactoryMock.Object,
            _roleAssignerMock.Object,
            _tokenGeneratorMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnSuccess_WhenValidSellerAdminRequest()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "selleradmin@example.com",
            Password = "Password123!",
            Role = "SellerAdmin",
            FirstName = "Jane",
            LastName = "Smith"
        };

        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = request.Email };
        var token = "jwt-token";

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult { IsValid = true });

        _userFactoryMock.Setup(uf => uf.CreateUserAsync(request.Email, request.Password, It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCreationResult { Succeeded = true, User = user });

        _roleAssignerMock.Setup(ra => ra.AssignRoleAsync(user, request.Role, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RoleAssignmentResult { Succeeded = true });

        _tokenGeneratorMock.Setup(tg => tg.GenerateToken(user, request.Role))
            .Returns(token);

        // Act
        var result = await _strategy.RegisterAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(user.Id, result.Value.UserId);
        Assert.Equal(token, result.Value.Token);
        Assert.NotNull(result.Value.TenantId);
        Assert.NotEqual(Guid.Empty, result.Value.TenantId);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnFailure_WhenValidationFails()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "invalid@example.com",
            Password = "Password123!",
            Role = "SellerAdmin",
            FirstName = "Jane",
            LastName = "Smith"
        };

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult { IsValid = false, ErrorMessage = "Validation failed" });

        // Act
        var result = await _strategy.RegisterAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Contains("Validation failed", result.Error);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnFailure_WhenWrongRole()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "selleradmin@example.com",
            Password = "Password123!",
            Role = "Customer", // Wrong role for SellerAdmin strategy
            FirstName = "Jane",
            LastName = "Smith"
        };

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult { IsValid = true });

        // Act
        var result = await _strategy.RegisterAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Contains("Invalid role for SellerAdmin registration strategy", result.Error);
    }
}
