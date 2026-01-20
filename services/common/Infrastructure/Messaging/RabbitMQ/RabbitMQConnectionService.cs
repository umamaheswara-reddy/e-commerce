using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Collections.Concurrent;

namespace ECommerce.Common.Infrastructure.Messaging.RabbitMQ;

/// <summary>
/// Shared RabbitMQ connection and basic infrastructure management service.
/// Provides common functionality for both publishing and infrastructure setup.
/// </summary>
public sealed class RabbitMQConnectionService : IAsyncDisposable
{
    private readonly ConnectionFactory _factory;
    private readonly ILogger<RabbitMQConnectionService> _logger;
    private IConnection? _connection;

    // Cache declarations to avoid duplicate broker calls across all instances
    private static readonly ConcurrentDictionary<string, bool> _declaredExchanges = new();
    private static readonly ConcurrentDictionary<string, bool> _declaredQueues = new();

    public RabbitMQConnectionService(
        IConfiguration configuration,
        ILogger<RabbitMQConnectionService> logger)
    {
        _logger = logger;

        // Configure connection factory
        _factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:HostName"],
            UserName = configuration["RabbitMQ:UserName"],
            Password = configuration["RabbitMQ:Password"],
            Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
            Ssl = new SslOption { Enabled = false }
        };
    }

    /// <summary>
    /// Creates or reuses a persistent RabbitMQ connection.
    /// </summary>
    public async Task<IConnection> GetOrCreateConnectionAsync(CancellationToken cancellationToken = default)
    {
        if (_connection?.IsOpen == true)
            return _connection;

        try
        {
            _connection = await _factory.CreateConnectionAsync(cancellationToken);
            _logger.LogInformation("RabbitMQ connection established to {Host}", _factory.HostName);
        }
        catch (AuthenticationFailureException)
        {
            throw new RabbitMqAuthenticationException();
        }
        catch (BrokerUnreachableException)
        {
            throw new RabbitMqUnreachableException();
        }

        return _connection;
    }

    /// <summary>
    /// Declares the exchange if it hasn't been declared already.
    /// </summary>
    public static async Task EnsureExchangeDeclaredAsync(
        IChannel channel,
        string exchangeName,
        CancellationToken cancellationToken = default)
    {
        if (_declaredExchanges.ContainsKey(exchangeName))
            return;

        await channel.ExchangeDeclareAsync(
            exchange: exchangeName,
            type: ExchangeType.Direct,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        _declaredExchanges.TryAdd(exchangeName, true);
    }

    /// <summary>
    /// Declares the queue if it hasn't been declared already.
    /// </summary>
    public static async Task EnsureQueueDeclaredAsync(
        IChannel channel,
        string queueName,
        Dictionary<string, object?>? arguments = null,
        CancellationToken cancellationToken = default)
    {
        if (_declaredQueues.ContainsKey(queueName))
            return;

        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: arguments,
            cancellationToken: cancellationToken);

        _declaredQueues.TryAdd(queueName, true);
    }

    /// <summary>
    /// Creates a channel and ensures proper cleanup.
    /// </summary>
    public async Task<IChannel> CreateChannelAsync(CancellationToken cancellationToken = default)
    {
        var connection = await GetOrCreateConnectionAsync(cancellationToken);
        var options = new CreateChannelOptions(
            publisherConfirmationsEnabled: false,
            publisherConfirmationTrackingEnabled: false
        );
        return await connection.CreateChannelAsync(options, cancellationToken);
    }

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
}
