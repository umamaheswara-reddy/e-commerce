namespace ECommerce.Common.Infrastructure.Abstractions;

public interface IMessagePublisher
{
    Task PublishAsync<TEvent>(TEvent eventData, string? exchange = null,
        string? routingKey = null, CancellationToken cancellationToken = default) where TEvent : IIntegrationEvent;
}
