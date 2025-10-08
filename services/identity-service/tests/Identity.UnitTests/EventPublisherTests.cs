using ECommerce.Common.Contracts.Identity.IntegrationEvents;
using ECommerce.Common.Infrastructure.Abstractions;
using ECommerce.Common.Infrastructure.Services;
using Identity.Domain.Entities;
using Microsoft.Extensions.Logging;
using Moq;

namespace Identity.UnitTests;

public class EventPublisherTests
{
    private readonly Mock<IMessagePublisher> _messagePublisherMock;
    private readonly Mock<ILogger<EventPublisher>> _loggerMock;
    private readonly EventPublisher _eventPublisher;

    public EventPublisherTests()
    {
        _messagePublisherMock = new Mock<IMessagePublisher>();
        _loggerMock = new Mock<ILogger<EventPublisher>>();
        _eventPublisher = new EventPublisher(_messagePublisherMock.Object);
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

        AccountRegisteredIntegrationEvent capturedEvent = null;
        _messagePublisherMock.Setup(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default))
            .Callback<AccountRegisteredIntegrationEvent>((evt) => capturedEvent = evt)
            .Returns(Task.CompletedTask);

        // Act
        var userRegisteredDomainEvent = new AccountRegisteredIntegrationEvent(user.Id, user.Email!, role, null, DateTime.UtcNow);
        await _eventPublisher.PublishAsync(userRegisteredDomainEvent, cancellationToken: default);

        // Assert
        Assert.NotNull(capturedEvent);
        Assert.Equal(user.Id, capturedEvent.AccountId);
        Assert.Equal(user.Email, capturedEvent.Email);
        Assert.Equal(role, capturedEvent.Role);
        Assert.Equal(user.TenantId, capturedEvent.TenantId);
        Assert.True(capturedEvent.RegisteredAt <= DateTime.UtcNow);
        Assert.True(capturedEvent.RegisteredAt >= DateTime.UtcNow.AddSeconds(-1)); // Allow small time difference

        _messagePublisherMock.Verify(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default), Times.Once);
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

        AccountRegisteredIntegrationEvent capturedEvent = null;
        _messagePublisherMock.Setup(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default))
            .Callback<AccountRegisteredIntegrationEvent>((evt) => capturedEvent = evt)
            .Returns(Task.CompletedTask);

        // Act
        var userRegisteredDomainEvent = new AccountRegisteredIntegrationEvent(user.Id, user.Email!, role, null, DateTime.UtcNow);
        await _eventPublisher.PublishAsync(userRegisteredDomainEvent, cancellationToken: default);

        // Assert
        Assert.NotNull(capturedEvent);
        Assert.Equal(user.Id, capturedEvent.AccountId);
        Assert.Equal(user.Email, capturedEvent.Email);
        Assert.Equal(role, capturedEvent.Role);
        Assert.Null(capturedEvent.TenantId);


        _messagePublisherMock.Verify(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default), Times.Once);
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

        _messagePublisherMock.Setup(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default))
            .ThrowsAsync(new Exception("Message broker unavailable"));

        // Act & Assert
        var userRegisteredDomainEvent = new AccountRegisteredIntegrationEvent(user.Id, user.Email!, role, null, DateTime.UtcNow);
        await Assert.ThrowsAsync<Exception>(() => _eventPublisher.PublishAsync(userRegisteredDomainEvent, cancellationToken: default));

        _messagePublisherMock.Verify(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default), Times.Once);
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

        AccountRegisteredIntegrationEvent capturedEvent = null;
        _messagePublisherMock.Setup(mp => mp.PublishAsync(It.IsAny<AccountRegisteredIntegrationEvent>(), default, default, default))
            .Callback<AccountRegisteredIntegrationEvent>((evt) => capturedEvent = evt)
            .Returns(Task.CompletedTask);

        // Act
        var userRegisteredDomainEvent = new AccountRegisteredIntegrationEvent(user.Id, user.Email!, role, null, DateTime.UtcNow);
        await _eventPublisher.PublishAsync(userRegisteredDomainEvent, cancellationToken: default);

        // Assert
        Assert.NotNull(capturedEvent);
        Assert.True(capturedEvent.RegisteredAt >= beforeCall);
        Assert.True(capturedEvent.RegisteredAt <= DateTime.UtcNow);
    }
}
