namespace ECommerce.Common.Infrastructure.Abstractions;

/// <summary>
/// Defines the contract for RabbitMQ infrastructure setup operations.
/// </summary>
public interface IRabbitMQInfrastructureSetup
{
    /// <summary>
    /// Sets up RabbitMQ infrastructure (exchanges, queues, bindings) based on provided definitions.
    /// </summary>
    /// <param name="queueDefinitions">Collection of queue definitions to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SetupInfrastructureAsync(
        IEnumerable<QueueDefinition> queueDefinitions,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Defines a queue and its bindings for RabbitMQ infrastructure setup.
/// </summary>
public class QueueDefinition
{
    /// <summary>
    /// Name of the queue to create.
    /// </summary>
    public required string QueueName { get; set; }

    /// <summary>
    /// Name of the exchange to bind the queue to.
    /// </summary>
    public required string Exchange { get; set; }

    /// <summary>
    /// Routing keys for binding the queue to the exchange.
    /// </summary>
    public required IEnumerable<string> RoutingKeys { get; set; }

    /// <summary>
    /// Name of the dead letter exchange (optional).
    /// </summary>
    public string? DeadLetterExchange { get; set; }

    /// <summary>
    /// Name of the dead letter queue (optional).
    /// </summary>
    public string? DeadLetterQueue { get; set; }

    /// <summary>
    /// Routing key for dead letter messages (optional).
    /// </summary>
    public string? DeadLetterRoutingKey { get; set; }

    /// <summary>
    /// Time-to-live for messages in milliseconds (optional).
    /// </summary>
    public long? MessageTtl { get; set; }

    /// <summary>
    /// Queue type (classic, quorum, stream) (optional).
    /// </summary>
    public string? QueueType { get; set; }
}
