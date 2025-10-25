using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.Exceptions;
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
            "SuperAdmin" => throw UnsupportedRegistrationRoleException.ForRole(role),
            _ => throw UnsupportedRegistrationRoleException.Custom($"No registration strategy defined for role: {role}")
        };
    }
}
