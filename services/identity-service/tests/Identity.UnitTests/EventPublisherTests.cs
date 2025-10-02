using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;
using ECommerce.Shared.Contracts.Identity.Events;

namespace Identity.UnitTests;

public class EventPublisherTests
{
    private readonly Mock<IMessagePublisher> _messagePublisherMock;
    private readonly Mock<ILogger<EventPublisher>> _loggerMock;
    private readonly EventPublisher _publisher;

    public EventPublisherTests()
    {
        _messagePublisherMock = new Mock<IMessagePublisher>();
        _loggerMock = new Mock<ILogger<EventPublisher>>();
        _publisher = new EventPublisher(_messagePublisherMock.Object);
    }

    [Fact]
    public async Task PublishAccountRegisteredEventAsync_ShouldPublishEventWithCorrectData()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            TenantId = Guid.NewGuid()
        };
        var role = "SellerAdmin";

        AccountRegisteredEvent capturedEvent = null;
        _messagePublisherMock.Setup(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()))
            .Callback<AccountRegisteredEvent>(evt => capturedEvent = evt)
            .Returns(Task.CompletedTask);

        // Act
        await _publisher.PublishAccountRegisteredEventAsync(user, role);

        // Assert
        Assert.NotNull(capturedEvent);
        Assert.Equal(user.Id, capturedEvent.AccountId);
        Assert.Equal(user.Email, capturedEvent.Email);
        Assert.Equal(role, capturedEvent.Role);
        Assert.Equal(user.TenantId, capturedEvent.TenantId);
        Assert.True(capturedEvent.RegisteredAt <= DateTime.UtcNow);
        Assert.True(capturedEvent.RegisteredAt >= DateTime.UtcNow.AddSeconds(-1)); // Allow small time difference

        _messagePublisherMock.Verify(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()), Times.Once);
    }

    [Fact]
    public async Task PublishAccountRegisteredEventAsync_ShouldPublishEventWithNullTenantId_WhenUserHasNoTenant()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "customer@example.com",
            TenantId = null
        };
        var role = "Customer";

        AccountRegisteredEvent capturedEvent = null;
        _messagePublisherMock.Setup(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()))
            .Callback<AccountRegisteredEvent>(evt => capturedEvent = evt)
            .Returns(Task.CompletedTask);

        // Act
        await _publisher.PublishAccountRegisteredEventAsync(user, role);

        // Assert
        Assert.NotNull(capturedEvent);
        Assert.Equal(user.Id, capturedEvent.AccountId);
        Assert.Equal(user.Email, capturedEvent.Email);
        Assert.Equal(role, capturedEvent.Role);
        Assert.Null(capturedEvent.TenantId);

        _messagePublisherMock.Verify(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()), Times.Once);
    }

    [Fact]
    public async Task PublishAccountRegisteredEventAsync_ShouldHandleExceptionFromMessagePublisher()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };
        var role = "Customer";

        _messagePublisherMock.Setup(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()))
            .ThrowsAsync(new Exception("Message broker unavailable"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _publisher.PublishAccountRegisteredEventAsync(user, role));

        _messagePublisherMock.Verify(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()), Times.Once);
    }

    [Fact]
    public async Task PublishAccountRegisteredEventAsync_ShouldCreateEventWithCurrentTimestamp()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };
        var role = "Customer";
        var beforeCall = DateTime.UtcNow;

        AccountRegisteredEvent capturedEvent = null;
        _messagePublisherMock.Setup(mp => mp.PublishAccountRegisteredEventAsync(It.IsAny<AccountRegisteredEvent>()))
            .Callback<AccountRegisteredEvent>(evt => capturedEvent = evt)
            .Returns(Task.CompletedTask);

        // Act
        await _publisher.PublishAccountRegisteredEventAsync(user, role);

        // Assert
        Assert.NotNull(capturedEvent);
        Assert.True(capturedEvent.RegisteredAt >= beforeCall);
        Assert.True(capturedEvent.RegisteredAt <= DateTime.UtcNow);
    }
}
