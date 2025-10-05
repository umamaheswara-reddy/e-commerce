namespace ECommerce.Common.Infrastructure;
public interface IIntegrationEvent
{
    string Email { get; }
    string Role { get; }
}
