using ECommerce.Common.Infrastructure.Abstractions;

namespace ECommerce.Common.Infrastructure.Eventing;

public class EventPublisher(IMessagePublisher messagePublisher) : IIntegrationEventPublisher
{
    private readonly IMessagePublisher _messagePublisher = messagePublisher;

    public async Task PublishAsync<TEvent>(TEvent @integrationEvent
        , IntegrationEventMetadata? metadata = null
        , CancellationToken cancellationToken = default) where TEvent : IIntegrationEvent
    {
        ArgumentNullException.ThrowIfNull(@integrationEvent);
        await _messagePublisher.PublishAsync(@integrationEvent, cancellationToken: cancellationToken);
    }
}
