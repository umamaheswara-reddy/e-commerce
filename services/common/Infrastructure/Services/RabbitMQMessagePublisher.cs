using ECommerce.Common.Infrastructure.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Collections.Concurrent;
using System.Net.Security;
using System.Security.Authentication;
using System.Text;
using System.Text.Json;

namespace ECommerce.Common.Infrastructure.Services;

/// <summary>
/// A resilient, convention-based RabbitMQ message publisher for integration events.
/// Supports retry, TLS, and connection reuse.
/// </summary>
public sealed class RabbitMQMessagePublisher : IMessagePublisher, IAsyncDisposable
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RabbitMQMessagePublisher> _logger;
    private readonly ConnectionFactory _factory;
    private IConnection? _connection;
    private readonly AsyncPolicy _retryPolicy;
    private readonly JsonSerializerOptions _jsonOptions;

    // Cache exchange declarations to avoid duplicate broker calls
    private static readonly ConcurrentDictionary<string, bool> DeclaredExchanges = new();

    public RabbitMQMessagePublisher(
        IConfiguration configuration,
        ILogger<RabbitMQMessagePublisher> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Configure connection factory
        _factory = new ConnectionFactory
        {
            HostName = _configuration["RabbitMQ:HostName"],
            UserName = _configuration["RabbitMQ:UserName"],
            Password = _configuration["RabbitMQ:Password"],
            Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672"),
            // Disable SSL for development environment
            Ssl = new SslOption
            {
                Enabled = false
            }
        };

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
            var connection = await GetOrCreateConnectionAsync(cancellationToken);
            await using var channel = await connection.CreateChannelAsync(cancellationToken:cancellationToken);

            await EnsureExchangeDeclaredAsync(channel, exchangeName, cancellationToken);

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
    /// Creates or reuses a persistent RabbitMQ connection.
    /// </summary>
    private async Task<IConnection> GetOrCreateConnectionAsync(CancellationToken cancellationToken)
    {
        if (_connection?.IsOpen == true)
            return _connection;

        try
        {
            _connection = await _factory.CreateConnectionAsync(cancellationToken);
            _logger.LogInformation("RabbitMQ connection established to {Host}", _factory.HostName);
        }
        catch (AuthenticationFailureException ex)
        {
            throw new RabbitMqAuthenticationException();
        }
        catch (BrokerUnreachableException ex)
        {
            throw new RabbitMqUnreachableException();
        }

        return _connection;
    }

    /// <summary>
    /// Declares the exchange if it hasn't been declared already.
    /// </summary>
    private static async Task EnsureExchangeDeclaredAsync(IChannel channel, string exchangeName, CancellationToken cancellationToken)
    {
        if (DeclaredExchanges.ContainsKey(exchangeName))
            return;

        await channel.ExchangeDeclareAsync(
            exchange: exchangeName,
            type: ExchangeType.Direct,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        DeclaredExchanges.TryAdd(exchangeName, true);
    }

    /// <summary>
    /// Converts a namespace-based event type to a domain-specific exchange name.
    /// </summary>
    private static string ResolveExchangeName<TEvent>()
    {
        var ns = typeof(TEvent).Namespace ?? "ecommerce";
        var domain = ns.Split('.')
            .FirstOrDefault(n => n.EndsWith("Domain", StringComparison.OrdinalIgnoreCase))
            ?.Replace("Domain", "", StringComparison.OrdinalIgnoreCase)
            .ToLowerInvariant() ?? "ecommerce";

        return $"{domain}-events";
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

    #region 🧹 Cleanup

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_connection is { IsOpen: true })
                await _connection.CloseAsync();
            _connection?.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error disposing RabbitMQ connection.");
        }
    }

    #endregion
}
