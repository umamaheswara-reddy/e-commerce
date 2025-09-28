using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using ECommerce.Shared.Contracts.Identity.Events;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Identity.Infrastructure.Services;

public class RabbitMQMessagePublisher : IMessagePublisher
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RabbitMQMessagePublisher> _logger;
    private readonly ConnectionFactory _factory;

    public RabbitMQMessagePublisher(IConfiguration configuration, ILogger<RabbitMQMessagePublisher> logger)
    {
        _configuration = configuration;
        _logger = logger;

        _factory = new ConnectionFactory
        {
            HostName = _configuration["RabbitMQ:HostName"],
            UserName = _configuration["RabbitMQ:UserName"],
            Password = _configuration["RabbitMQ:Password"],
            Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672")
        };
    }

    public Task PublishAccountRegisteredEventAsync(AccountRegisteredEvent eventData)
    {
        try
        {
            using var connection = _factory.CreateConnection();
            using var channel = connection.CreateModel();

            // Declare exchange
            channel.ExchangeDeclare("identity-events", ExchangeType.Direct, durable: true);

            // Declare queue
            channel.QueueDeclare("account-registered", durable: true, exclusive: false, autoDelete: false);

            // Bind queue to exchange
            channel.QueueBind("account-registered", "identity-events", "account.registered");

            var message = JsonSerializer.Serialize(eventData);
            var body = Encoding.UTF8.GetBytes(message);

            var properties = channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.ContentType = "application/json";

            channel.BasicPublish("identity-events", "account.registered", properties, body);

            _logger.LogInformation("Published AccountRegisteredEvent for user {Email} with role {Role}", eventData.Email, eventData.Role);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish AccountRegisteredEvent for user {Email}. Continuing with registration.", eventData.Email);
            // Don't throw - we don't want to fail registration if messaging fails
        }

        return Task.CompletedTask;
    }
}
