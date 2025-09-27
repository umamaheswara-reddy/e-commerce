namespace ECommerce.Shared.Contracts.Identity.Events;

public record AccountRegisteredEvent(Guid AccountId, string Email, DateTime RegisteredAt);
