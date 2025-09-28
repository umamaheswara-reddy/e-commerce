using Identity.Domain.Entities;

namespace Identity.Application.Abstractions;

public interface IEventPublisher
{
    Task PublishAccountRegisteredEventAsync(ApplicationUser user, string role);
}
