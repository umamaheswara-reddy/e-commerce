using ECommerce.Common.Contracts.Identity.Events;

namespace Identity.Infrastructure.Services;

public interface IMessagePublisher
{
    Task PublishAccountRegisteredEventAsync(AccountRegisteredEvent eventData);
}
