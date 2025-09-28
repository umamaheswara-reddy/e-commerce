using Identity.Application.Registration.DTOs;
using Moq;
using Microsoft.Extensions.Logging;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration;

namespace Identity.UnitTests;

public class UserRegistrationCoordinatorTests
{
    private readonly Mock<IRegistrationStrategyFactory> _strategyFactoryMock;
    private readonly Mock<ILogger<UserRegistrationCoordinator>> _loggerMock;
    private readonly Mock<IRegistrationStrategy> _strategyMock;
    private readonly UserRegistrationCoordinator _coordinator;

    public UserRegistrationCoordinatorTests()
    {
        _strategyFactoryMock = new Mock<IRegistrationStrategyFactory>();
        _loggerMock = new Mock<ILogger<UserRegistrationCoordinator>>();
        _strategyMock = new Mock<IRegistrationStrategy>();

        _coordinator = new UserRegistrationCoordinator(
            _strategyFactoryMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldReturnSuccess_WhenStrategySucceeds()
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

        var expectedResponse = new RegisterResponseDto
        {
            Success = true,
            Message = "Registration successful.",
            UserId = Guid.NewGuid()
        };

        _strategyFactoryMock.Setup(f => f.GetStrategy(request.Role))
            .Returns(_strategyMock.Object);

        _strategyMock.Setup(s => s.RegisterAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _coordinator.RegisterUserAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Registration successful.", result.Message);
        Assert.Equal(expectedResponse.UserId, result.UserId);
        _strategyFactoryMock.Verify(f => f.GetStrategy(request.Role), Times.Once);
        _strategyMock.Verify(s => s.RegisterAsync(request), Times.Once);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldReturnFailure_WhenStrategyFails()
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

        var expectedResponse = new RegisterResponseDto
        {
            Success = false,
            Message = "User with this email already exists."
        };

        _strategyFactoryMock.Setup(f => f.GetStrategy(request.Role))
            .Returns(_strategyMock.Object);

        _strategyMock.Setup(s => s.RegisterAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _coordinator.RegisterUserAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User with this email already exists.", result.Message);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldReturnFailure_WhenUnsupportedRoleIsProvided()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe",
            Role = "SuperAdmin"
        };

        _strategyFactoryMock.Setup(f => f.GetStrategy(request.Role))
            .Throws(new InvalidOperationException("SuperAdmin registration is not supported through this flow. SuperAdmin accounts are provisioned during application startup."));

        // Act
        var result = await _coordinator.RegisterUserAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("An error occurred during registration.", result.Message);
    }
}
