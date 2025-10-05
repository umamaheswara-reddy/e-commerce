using ECommerce.Common.Domain;

namespace ECommerce.Common.Infrastructure.Abstractions;

public interface IEventPublisher
{
    // For distributed systems, we often need correlation IDs, tenant IDs, or trace context for observability
    Task PublishAsync<TEvent>(TEvent @integrationEvent, IDictionary<string, string>? metadata = null, CancellationToken cancellationToken = default) where TEvent : IIntegrationEvent;
}
