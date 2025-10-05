using ECommerce.Common.Domain;

namespace Identity.Domain.Events;

public sealed record UserRegisteredDomainEvent(
    Guid UserId,
    string Email,
    string Role,
    DateTime OccurredOn
) : IDomainEvent
{
    public UserRegisteredDomainEvent(Guid userId, string email, string role)
        : this(userId, email, role, DateTime.UtcNow)
    {
    }
}
