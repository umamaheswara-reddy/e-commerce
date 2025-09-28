namespace Identity.Domain.Events;

public record UserRegisteredDomainEvent(Guid UserId, string Email, string Role) : IDomainEvent;
