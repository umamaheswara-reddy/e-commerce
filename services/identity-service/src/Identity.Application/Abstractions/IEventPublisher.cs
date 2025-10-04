using System.Threading.Tasks;

namespace Identity.Application.Abstractions;

public interface IEventPublisher
{
    Task PublishAccountRegisteredEventAsync(System.Guid userId, string email, string role);
}
