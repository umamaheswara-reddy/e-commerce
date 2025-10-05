//using Identity.Domain.Events;
//using MediatR;
//using Microsoft.Extensions.Logging;

//namespace Identity.Application.EventHandlers;

//public class SendWelcomeEmailHandler(ILogger<SendWelcomeEmailHandler> logger) : INotificationHandler<UserRegisteredDomainEvent>
//{
//    public async Task Handle(UserRegisteredDomainEvent notification, CancellationToken cancellationToken)
//    {
//        // Simulate sending welcome email
//        logger.LogInformation("Sending welcome email to {Email} for role {Role}", notification.Email, notification.Role);

//        // In a real application, integrate with email service
//        await Task.CompletedTask;
//    }
//}
