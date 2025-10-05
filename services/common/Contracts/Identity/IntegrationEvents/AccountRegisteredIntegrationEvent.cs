using ECommerce.Common.Infrastructure;

namespace ECommerce.Common.Contracts.Identity.IntegrationEvents;

public record AccountRegisteredIntegrationEvent(Guid AccountId, string Email, string Role, Guid? TenantId, DateTime RegisteredAt) : IIntegrationEvent
{
    string IIntegrationEvent.Email => Email;
    string IIntegrationEvent.Role => Role;
}
