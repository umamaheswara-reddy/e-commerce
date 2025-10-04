using ECommerce.Common;
using Identity.Application.Abstractions;
using Identity.Domain.Events;
using MediatR;

namespace Identity.Application.Events;

public class PublishUserRegisteredIntegrationEventHandler(IEventPublisher eventPublisher) : INotificationHandler<UserRegisteredDomainEvent>
{
    public async Task Handle(UserRegisteredDomainEvent notification, CancellationToken cancellationToken)
    {
        // Publish integration event using the domain event data
        await eventPublisher.PublishAccountRegisteredEventAsync(notification.UserId, notification.Email, notification.Role);
    }
}
