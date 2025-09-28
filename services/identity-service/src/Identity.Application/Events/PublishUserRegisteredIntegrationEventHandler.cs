using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Domain.Events;
using MediatR;

namespace Identity.Application.Events;

public class PublishUserRegisteredIntegrationEventHandler(IEventPublisher eventPublisher) : INotificationHandler<UserRegisteredDomainEvent>
{
    public async Task Handle(UserRegisteredDomainEvent notification, CancellationToken cancellationToken)
    {
        // Create a dummy user object for the event publisher
        var user = new ApplicationUser
        {
            Id = notification.UserId,
            Email = notification.Email,
            UserName = notification.Email
        };

        await eventPublisher.PublishAccountRegisteredEventAsync(user, notification.Role);
    }
}
