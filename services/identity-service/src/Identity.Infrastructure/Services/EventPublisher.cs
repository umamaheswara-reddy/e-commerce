using ECommerce.Common.Contracts.Identity.Events;
using ECommerce.Common;
using Identity.Application.Abstractions;
using Identity.Domain.Entities;

namespace Identity.Infrastructure.Services;

public class EventPublisher : IEventPublisher
{
    private readonly IMessagePublisher _messagePublisher;

    public EventPublisher(IMessagePublisher messagePublisher)
    {
        _messagePublisher = messagePublisher;
    }

    public async Task PublishAccountRegisteredEventAsync(Guid userId, string email, string role)
    {
        var eventData = new AccountRegisteredEvent(userId, email, role, null, DateTime.UtcNow);
        await _messagePublisher.PublishAccountRegisteredEventAsync(eventData);
    }
}
