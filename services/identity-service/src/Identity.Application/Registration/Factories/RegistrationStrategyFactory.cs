using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.Strategies;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Application.Registration.Factories;

public class RegistrationStrategyFactory(IServiceProvider serviceProvider) : IRegistrationStrategyFactory
{
    public IRegistrationStrategy GetStrategy(string role)
    {
        return role switch
        {
            "SellerAdmin" => serviceProvider.GetRequiredService<SellerAdminRegistrationStrategy>(),
            "Customer" => serviceProvider.GetRequiredService<CustomerRegistrationStrategy>(),
            "SuperAdmin" => throw new InvalidOperationException("SuperAdmin registration is not supported through this flow. SuperAdmin accounts are provisioned during application startup."),
            _ => throw new InvalidOperationException($"No registration strategy defined for role: {role}")
        };
    }
}
