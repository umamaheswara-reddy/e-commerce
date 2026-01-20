using ECommerce.Common.Infrastructure.Abstractions;
using Microsoft.Extensions.Logging;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Text;
using System.Text.Json;

namespace ECommerce.Common.Infrastructure.Messaging.RabbitMQ;

/// <summary>
/// A resilient, convention-based RabbitMQ message publisher for integration events.
/// Supports retry, TLS, and connection reuse.
/// </summary>
public sealed class IRabbitMqEventPublisher : IMessagePublisher
{
    private readonly ILogger<IRabbitMqEventPublisher> _logger;
    private readonly RabbitMQConnectionService _connectionService;
    private readonly AsyncPolicy _retryPolicy;
    private readonly JsonSerializerOptions _jsonOptions;

    public IRabbitMqEventPublisher(
        RabbitMQConnectionService connectionService,
        ILogger<IRabbitMqEventPublisher> logger)
    {
        _connectionService = connectionService;
        _logger = logger;

        // Configure JSON serialization options
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        // Retry policy for transient broker/network issues
        _retryPolicy = Policy
            .Handle<BrokerUnreachableException>()
            .Or<AlreadyClosedException>()
            .Or<OperationInterruptedException>()
            .Or<PublishException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
                (ex, delay, attempt, _) =>
                {
                    _logger.LogWarning(ex,
                        "RabbitMQ publish attempt {Attempt} failed. Retrying in {DelaySeconds}s.",
                        attempt, delay.TotalSeconds);
                });
    }

    /// <inheritdoc/>
    public async Task PublishAsync<TEvent>(
        TEvent eventData,
        string? exchange = null,
        string? routingKey = null,
        CancellationToken cancellationToken = default)
        where TEvent : IIntegrationEvent
    {
        var exchangeName = !string.IsNullOrWhiteSpace(exchange)
            ? exchange
            : ResolveExchangeName<TEvent>();

        var routingKeyName = !string.IsNullOrWhiteSpace(routingKey)
            ? routingKey
            : ResolveRoutingKey<TEvent>();

        await _retryPolicy.ExecuteAsync(async () =>
        {
            await using var channel = await _connectionService.CreateChannelAsync(cancellationToken);

            var message = JsonSerializer.Serialize(eventData, _jsonOptions);
            var body = Encoding.UTF8.GetBytes(message);

            var properties = new BasicProperties
            {
                Persistent = true,
                ContentType = "application/json"
            };

            try
            {
                await channel.BasicPublishAsync(
                    exchange: exchangeName,
                    routingKey: routingKeyName,
                    mandatory: false,
                    basicProperties: properties,
                    body: body,
                    cancellationToken: cancellationToken);

                _logger.LogInformation(
                    "✅ Published {EventType} to exchange '{Exchange}' with routing key '{RoutingKey}'",
                    typeof(TEvent).Name, exchangeName, routingKeyName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "❌ Failed to publish {EventType} to {Exchange}/{RoutingKey}",
                    typeof(TEvent).Name, exchangeName, routingKeyName);
                throw;
            }
        });
    }

    #region 🔧 Helpers

    /// <summary>
    /// Converts a namespace-based event type to a domain-specific exchange name.
    /// </summary>
    private static string ResolveExchangeName<TEvent>()
    {
        var ns = typeof(TEvent).Namespace ?? "ecommerce";
        var domainName = ns.Contains(".IntegrationEvents")
                        ? ns.Split('.').Reverse().Skip(1).First()
                        : "ecommerce";

        return $"{domainName}-events";
    }

    /// <summary>
    /// Converts an event class name into a kebab-style routing key.
    /// Example: AccountRegisteredIntegrationEvent → account.registered
    /// </summary>
    private static string ResolveRoutingKey<TEvent>()
    {
        var name = typeof(TEvent).Name
            .Replace("IntegrationEvent", "", StringComparison.OrdinalIgnoreCase)
            .Replace("Event", "", StringComparison.OrdinalIgnoreCase);

        return string.Concat(name.Select((ch, i) =>
            i > 0 && char.IsUpper(ch) ? "." + char.ToLower(ch) : char.ToLower(ch).ToString()))
            .Trim('.');
    }

    #endregion
}
