namespace ECommerce.Common.Infrastructure.Abstractions;

public interface IMessagePublisher
{
    Task PublishAsync<TEvent>(TEvent eventData, CancellationToken cancellationToken = default)
        where TEvent : IIntegrationEvent;
}
