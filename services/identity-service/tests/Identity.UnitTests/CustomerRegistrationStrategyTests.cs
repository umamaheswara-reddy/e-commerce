using Identity.Application.Registration.DTOs;
using Identity.Domain.Entities;
using Microsoft.Extensions.Logging;
using Moq;
using Identity.Application.Registration.Strategies;
using Identity.Application.Abstractions;

namespace Identity.UnitTests;

public class CustomerRegistrationStrategyTests
{
    private readonly Mock<IUserValidator> _userValidatorMock;
    private readonly Mock<IUserFactory> _userFactoryMock;
    private readonly Mock<IRoleAssigner> _roleAssignerMock;
    private readonly Mock<ITokenGenerator> _tokenGeneratorMock;
    private readonly Mock<IEventPublisher> _eventPublisherMock;
    private readonly Mock<ILogger<CustomerRegistrationStrategy>> _loggerMock;
    private readonly CustomerRegistrationStrategy _strategy;

    public CustomerRegistrationStrategyTests()
    {
        _userValidatorMock = new Mock<IUserValidator>();
        _userFactoryMock = new Mock<IUserFactory>();
        _roleAssignerMock = new Mock<IRoleAssigner>();
        _tokenGeneratorMock = new Mock<ITokenGenerator>();
        _eventPublisherMock = new Mock<IEventPublisher>();
        _loggerMock = new Mock<ILogger<CustomerRegistrationStrategy>>();

        _strategy = new CustomerRegistrationStrategy(
            _userValidatorMock.Object,
            _userFactoryMock.Object,
            _roleAssignerMock.Object,
            _tokenGeneratorMock.Object,
            _eventPublisherMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateCustomerWithoutTenantId()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "customer@example.com",
            Password = "password123",
            FirstName = "Jane",
            LastName = "Doe",
            Role = "Customer"
        };

        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = request.Email };

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request))
            .ReturnsAsync(ValidationResult.Success());

        _userFactoryMock.Setup(uf => uf.CreateUserAsync(request.Email, request.Password, null))
            .ReturnsAsync(new UserCreationResult { Succeeded = true, User = user });

        _roleAssignerMock.Setup(ra => ra.AssignRoleAsync(user, request.Role))
            .ReturnsAsync(new RoleAssignmentResult { Succeeded = true });

        _tokenGeneratorMock.Setup(tg => tg.GenerateToken(user, request.Role))
            .Returns("jwt-token");

        _eventPublisherMock.Setup(ep => ep.PublishAccountRegisteredEventAsync(user, request.Role))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _strategy.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal("jwt-token", result.Token);
        Assert.Null(result.TenantId);

        _userValidatorMock.Verify(uv => uv.ValidateAsync(request), Times.Once);
        _userFactoryMock.Verify(uf => uf.CreateUserAsync(request.Email, request.Password, null), Times.Once);
        _roleAssignerMock.Verify(ra => ra.AssignRoleAsync(user, request.Role), Times.Once);
        _tokenGeneratorMock.Verify(tg => tg.GenerateToken(user, request.Role), Times.Once);
        _eventPublisherMock.Verify(ep => ep.PublishAccountRegisteredEventAsync(user, request.Role), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnFailure_WhenValidationFails()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "password123",
            FirstName = "Jane",
            LastName = "Doe",
            Role = "Customer"
        };

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request))
            .ReturnsAsync(ValidationResult.Failure("User with this email already exists."));

        // Act
        var result = await _strategy.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User with this email already exists.", result.Message);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnFailure_WhenUserCreationFails()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "customer@example.com",
            Password = "password123",
            FirstName = "Jane",
            LastName = "Doe",
            Role = "Customer"
        };

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request))
            .ReturnsAsync(ValidationResult.Success());

        _userFactoryMock.Setup(uf => uf.CreateUserAsync(request.Email, request.Password, null))
            .ReturnsAsync(new UserCreationResult { Succeeded = false, Errors = new[] { "Email already in use" } });

        // Act
        var result = await _strategy.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Email already in use", result.Message);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnFailure_WhenInvalidRoleProvided()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "customer@example.com",
            Password = "password123",
            FirstName = "Jane",
            LastName = "Doe",
            Role = "SellerAdmin" // Wrong role for this strategy
        };

        _userValidatorMock.Setup(uv => uv.ValidateAsync(request))
            .ReturnsAsync(ValidationResult.Success());

        // Act
        var result = await _strategy.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid role for Customer registration strategy.", result.Message);
    }
}
