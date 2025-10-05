using ECommerce.Common.Contracts.Identity.IntegrationEvents;
using ECommerce.Common.Infrastructure.Abstractions;
using Identity.Domain.Events;
using MediatR;

namespace Identity.Application.EventHandlers;

public sealed class UserRegisteredIntegrationEventHandler(IEventPublisher eventPublisher) : INotificationHandler<UserRegisteredDomainEvent>
{
    public async Task Handle(UserRegisteredDomainEvent notification, CancellationToken cancellationToken)
    {
        // Mapping domain event --> integration event
        var integrationEvent = new AccountRegisteredIntegrationEvent(
            notification.UserId,
            notification.Email,
            notification.Role,
            null,
            DateTime.UtcNow
        );

        // Publish domain event - the publisher will map to integration event
        await eventPublisher.PublishAsync(integrationEvent, cancellationToken: cancellationToken);
    }
}
