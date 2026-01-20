namespace ECommerce.Common.Infrastructure.Abstractions;

public interface IIntegrationEventPublisher
{
    // For distributed systems, we often need correlation IDs, tenant IDs, or trace context for observability
    Task PublishAsync<TEvent>(
        TEvent @integrationEvent,
        IntegrationEventMetadata? metadata = null,
        CancellationToken cancellationToken = default
    ) where TEvent : IIntegrationEvent;
}

public sealed class IntegrationEventMetadata
{
    public string? CorrelationId { get; init; }
    public string? TenantId { get; init; }
    public string? TraceId { get; init; }
    public IDictionary<string, string>? AdditionalProperties { get; init; }
}
