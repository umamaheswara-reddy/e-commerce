using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.Strategies;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Application.Registration.Factories;

public class RegistrationStrategyFactory(IServiceProvider serviceProvider) : IRegistrationStrategyFactory
{
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    public IRegistrationStrategy GetStrategy(string role)
    {
        return role switch
        {
            "SellerAdmin" => _serviceProvider.GetRequiredService<SellerAdminRegistrationStrategy>(),
            "Customer" => _serviceProvider.GetRequiredService<CustomerRegistrationStrategy>(),
            "SuperAdmin" => throw new InvalidOperationException("SuperAdmin registration is not supported through this flow. SuperAdmin accounts are provisioned during application startup."),
            _ => throw new InvalidOperationException($"No registration strategy defined for role: {role}")
        };
    }
}
