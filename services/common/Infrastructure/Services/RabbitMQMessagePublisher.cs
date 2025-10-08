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
    private IConnection? _persistentConnection;
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
                AcceptablePolicyErrors =
                    SslPolicyErrors.RemoteCertificateNameMismatch |
                    SslPolicyErrors.RemoteCertificateChainErrors
            }
        };

        // Retry transient issues like connection drop or broker unreachable
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
        string? exchange = null,
        string? routingKey = null,
        CancellationToken cancellationToken = default) where TEvent : IIntegrationEvent
    {
        // Determine exchange & routing key (client override > convention)
        var exchangeName = !string.IsNullOrWhiteSpace(exchange)
            ? exchange
            : ResolveExchangeName<TEvent>();

        var routingKeyName = !string.IsNullOrWhiteSpace(routingKey)
            ? routingKey
            : ResolveRoutingKey<TEvent>();

        await _retryPolicy.ExecuteAsync(async () =>
        {
            try
            {
                using var connection = await CreateConnectionAsync(cancellationToken);
                using var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

                await channel.ExchangeDeclareAsync(
                    exchange: exchangeName,
                    type: ExchangeType.Direct,
                    durable: true,
                    autoDelete: false,
                    arguments: null,
                    cancellationToken: cancellationToken
                );

                // Serialize message
                var message = JsonSerializer.Serialize(eventData);
                var body = Encoding.UTF8.GetBytes(message);

                var properties = new BasicProperties
                {
                    Persistent = true,
                    ContentType = "application/json"
                };

                await channel.BasicPublishAsync(
                    exchange: exchangeName,
                    routingKey: routingKeyName,
                    mandatory: false,
                    basicProperties: properties,
                    body: body,
                    cancellationToken: cancellationToken);

                _logger.LogInformation(
                    "Published event {EventType} to exchange '{Exchange}' with routing key '{RoutingKey}'",
                    typeof(TEvent).Name, exchangeName, routingKeyName);
            }
            catch (BrokerUnreachableException ex)
            {
                _logger.LogCritical(ex, "RabbitMQ unreachable. Check host, network, or credentials.");
                throw;
            }
            catch (AuthenticationFailureException ex)
            {
                _logger.LogCritical(ex, "RabbitMQ authentication failed. Check credentials or vhost.");
                throw;
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
                _logger.LogError(ex,
                    "Unexpected exception while publishing {EventType}", typeof(TEvent).Name);
                throw;
            }
        });
    }

    private async Task<IConnection> CreateConnectionAsync(CancellationToken cancellationToken)
    {
        if (_persistentConnection?.IsOpen == true)
            return _persistentConnection;

        _persistentConnection = await _factory.CreateConnectionAsync(cancellationToken);
        return _persistentConnection;
    }

    private static string ResolveExchangeName<TEvent>()
    {
        // Convention: "Identity.Domain.Events.AccountRegisteredIntegrationEvent"
        // -> "identity-events"
        var ns = typeof(TEvent).Namespace ?? "ecommerce";
        var domain = ns.Split('.')
            .FirstOrDefault(n => n.EndsWith("Domain", StringComparison.OrdinalIgnoreCase))
            ?.Replace("Domain", "", StringComparison.OrdinalIgnoreCase)
            .ToLowerInvariant() ?? "ecommerce";

        return $"{domain}-events";
    }

    private static string ResolveRoutingKey<TEvent>()
    {
        // Convention: AccountRegisteredIntegrationEvent -> account.registered
        var name = typeof(TEvent).Name
            .Replace("IntegrationEvent", "", StringComparison.OrdinalIgnoreCase)
            .Replace("Event", "", StringComparison.OrdinalIgnoreCase);

        return string.Concat(name.Select((ch, i) =>
            i > 0 && char.IsUpper(ch) ? "." + char.ToLower(ch) : char.ToLower(ch).ToString()))
            .Trim('.');
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
