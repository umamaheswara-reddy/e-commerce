namespace Identity.Application.Registration.Abstractions;

public interface IRegistrationStrategyFactory
{
    IRegistrationStrategy GetStrategy(string role);
}
