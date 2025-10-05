using ECommerce.Common.Infrastructure.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Net.Security;
using System.Security.Authentication;
using System.Text;
using System.Text.Json;

namespace ECommerce.Common.Infrastructure.Services;

public class RabbitMQMessagePublisher : IMessagePublisher, IDisposable
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RabbitMQMessagePublisher> _logger;
    private readonly ConnectionFactory _factory;
    private IConnection? _persistentConnection; // optional reuse
    private readonly AsyncPolicy _retryPolicy;

    public RabbitMQMessagePublisher(IConfiguration configuration, ILogger<RabbitMQMessagePublisher> logger)
    {
        _configuration = configuration;
        _logger = logger;

        _factory = new ConnectionFactory
        {
            HostName = _configuration["RabbitMQ:HostName"],
            UserName = _configuration["RabbitMQ:UserName"],
            Password = _configuration["RabbitMQ:Password"],
            Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672"),
            Ssl = new SslOption
            {
                Enabled = true,
                ServerName = _configuration["RabbitMQ:HostName"],
                Version = SslProtocols.Tls12,
                AcceptablePolicyErrors = SslPolicyErrors.RemoteCertificateNameMismatch |
                                             SslPolicyErrors.RemoteCertificateChainErrors
            }
        };

        // Define retry policy for transient errors
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

    public async Task PublishAsync<TEvent>(
        TEvent eventData,
        CancellationToken cancellationToken = default) where TEvent : IIntegrationEvent
    {
        await _retryPolicy.ExecuteAsync(async () =>
        {
            try
            {
                // Create connection asynchronously
                using var connection = await CreateConnectionAsync(cancellationToken);

                // Create channel asynchronously
                var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

                await EnsureExchangeAndQueueAsync(channel, cancellationToken);

                // Serialize message
                var message = JsonSerializer.Serialize(eventData);
                var body = Encoding.UTF8.GetBytes(message);

                var properties = new BasicProperties
                {
                    Persistent = true,
                    ContentType = "application/json"
                };

                await channel.BasicPublishAsync("identity-events", "account.registered", false, properties, body, cancellationToken);

                _logger.LogInformation(
                    "Published integration event {EventType} for user {Email}, role {Role}",
                    typeof(TEvent).Name, eventData.Email, eventData.Role);

                // Clean-up (close)
                await channel.CloseAsync(cancellationToken);
                await connection.CloseAsync(cancellationToken);
            }
            catch (BrokerUnreachableException ex)
            {
                _logger.LogCritical(ex, "RabbitMQ authentication failed. Check credentials or vhost access.");
                throw; // non-recoverable
            }
            catch (AuthenticationFailureException ex)
            {
                _logger.LogCritical(ex, "RabbitMQ authentication failed. Check credentials or vhost access.");
                throw; // non-recoverable
            }
            catch (TopologyRecoveryException ex)
            {
                _logger.LogError(ex, "RabbitMQ topology recovery failed.");
            }
            catch (RabbitMQClientException ex)
            {
                _logger.LogError(ex, "RabbitMQ client error occurred.");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception while publishing event {EventType}", typeof(TEvent).Name);
                throw;
            }
        });
    }

    private static async Task EnsureExchangeAndQueueAsync(IChannel channel, CancellationToken cancellationToken)
    {
        // Use async API for declarations and bindings
        await channel.ExchangeDeclareAsync(
            exchange: "identity-events",
            type: ExchangeType.Direct,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        // Declare queue
        await channel.QueueDeclareAsync(
            queue: "account-registered",
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        // Bind queue to exchange
        await channel.QueueBindAsync(
            queue: "account-registered",
            exchange: "identity-events",
            routingKey: "account.registered",
            arguments: null,
            cancellationToken: cancellationToken);
    }

    private async Task<IConnection> CreateConnectionAsync(CancellationToken cancellationToken)
    {
        // You can optionally reuse a persistent connection to improve performance
        if (_persistentConnection?.IsOpen == true)
            return _persistentConnection;

        _persistentConnection = await _factory.CreateConnectionAsync(cancellationToken);
        return _persistentConnection;
    }

    public void Dispose()
    {
        try
        {
            _persistentConnection?.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error disposing RabbitMQ persistent connection.");
        }
    }

}
