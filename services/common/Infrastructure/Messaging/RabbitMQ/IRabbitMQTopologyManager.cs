using ECommerce.Common.Infrastructure.Abstractions;
using Microsoft.Extensions.Logging;

namespace ECommerce.Common.Infrastructure.Messaging.RabbitMQ;

/// <summary>
/// Service for setting up RabbitMQ infrastructure (exchanges, queues, bindings).
/// Follows Single Responsibility Principle by focusing only on infrastructure management.
/// </summary>
public sealed class IRabbitMQTopologyManager(
    RabbitMQConnectionService connectionService,
    ILogger<IRabbitMQTopologyManager> logger) : IRabbitMQInfrastructureSetup
{
    private readonly RabbitMQConnectionService _connectionService = connectionService;
    private readonly ILogger<IRabbitMQTopologyManager> _logger = logger;

    /// <inheritdoc/>
    public async Task SetupInfrastructureAsync(
        IEnumerable<QueueDefinition> queueDefinitions,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var channel = await _connectionService.CreateChannelAsync(cancellationToken);

            _logger.LogInformation("Setting up RabbitMQ infrastructure...");

            foreach (var queueDef in queueDefinitions)
            {
                // Declare dead letter exchange and queue if specified
                if (!string.IsNullOrEmpty(queueDef.DeadLetterExchange))
                {
                    await RabbitMQConnectionService.EnsureExchangeDeclaredAsync(channel, queueDef.DeadLetterExchange, cancellationToken);

                    // Declare dead letter queue if specified
                    if (!string.IsNullOrEmpty(queueDef.DeadLetterQueue))
                    {
                        await RabbitMQConnectionService.EnsureQueueDeclaredAsync(channel, queueDef.DeadLetterQueue, null, cancellationToken);

                        // Bind dead letter queue to dead letter exchange
                        await channel.QueueBindAsync(
                            queue: queueDef.DeadLetterQueue,
                            exchange: queueDef.DeadLetterExchange,
                            routingKey: queueDef.DeadLetterRoutingKey ?? "#",
                            cancellationToken: cancellationToken);
                    }
                }

                // Declare main exchange
                await RabbitMQConnectionService.EnsureExchangeDeclaredAsync(channel, queueDef.Exchange, cancellationToken);

                // Declare queue with arguments
                var queueArgs = BuildQueueArguments(queueDef);
                await RabbitMQConnectionService.EnsureQueueDeclaredAsync(channel, queueDef.QueueName, queueArgs, cancellationToken);

                // Create bindings
                foreach (var routingKey in queueDef.RoutingKeys)
                {
                    await channel.QueueBindAsync(
                        queue: queueDef.QueueName,
                        exchange: queueDef.Exchange,
                        routingKey: routingKey,
                        cancellationToken: cancellationToken);
                }

                _logger.LogInformation(
                    "✅ Configured queue '{Queue}' bound to exchange '{Exchange}' with routing keys: {RoutingKeys}",
                    queueDef.QueueName, queueDef.Exchange, string.Join(", ", queueDef.RoutingKeys));
            }

            _logger.LogInformation("RabbitMQ infrastructure setup completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to setup RabbitMQ infrastructure");
            throw;
        }
    }

    #region 🔧 Helpers

    /// <summary>
    /// Builds queue arguments from queue definition.
    /// </summary>
    private static Dictionary<string, object?> BuildQueueArguments(QueueDefinition queueDef)
    {
        var args = new Dictionary<string, object?>();

        if (!string.IsNullOrEmpty(queueDef.DeadLetterExchange))
        {
            args["x-dead-letter-exchange"] = queueDef.DeadLetterExchange;
        }

        if (!string.IsNullOrEmpty(queueDef.DeadLetterRoutingKey))
        {
            args["x-dead-letter-routing-key"] = queueDef.DeadLetterRoutingKey;
        }

        if (queueDef.MessageTtl.HasValue)
        {
            args["x-message-ttl"] = queueDef.MessageTtl.Value;
        }

        if (!string.IsNullOrEmpty(queueDef.QueueType))
        {
            args["x-queue-type"] = queueDef.QueueType;
        }

        return args;
    }

    #endregion
}
