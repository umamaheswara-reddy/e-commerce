using ECommerce.Common.Infrastructure.Abstractions;

namespace ECommerce.Common.Infrastructure.Services;

public class EventPublisher(IMessagePublisher messagePublisher) : IEventPublisher
{
    private readonly IMessagePublisher _messagePublisher = messagePublisher;

    public async Task PublishAsync<TEvent>(TEvent @integrationEvent
        , IDictionary<string, string>? metadata = null
        , CancellationToken cancellationToken = default) where TEvent : IIntegrationEvent
    {
        ArgumentNullException.ThrowIfNull(@integrationEvent);
        await _messagePublisher.PublishAsync(@integrationEvent, cancellationToken);
    }
}
