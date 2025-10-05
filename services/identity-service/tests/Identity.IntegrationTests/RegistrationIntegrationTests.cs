using ECommerce.Common.Behaviors;
using ECommerce.Common.Infrastructure.Abstractions;
using ECommerce.Common.Infrastructure.Services;
using Identity.Application.Abstractions;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.Commands;
using Identity.Application.Registration.Factories;
using Identity.Application.Registration.Strategies;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Identity.IntegrationTests;

public class RegistrationIntegrationTests : IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IdentityDbContext _dbContext;

    public RegistrationIntegrationTests()
    {
        var services = new ServiceCollection();

        // Add logging
        services.AddLogging();

        // Add configuration for RabbitMQ (dummy values for testing)
        var configuration = new Dictionary<string, string?>
        {
            ["RabbitMQ:HostName"] = "localhost",
            ["RabbitMQ:UserName"] = "guest",
            ["RabbitMQ:Password"] = "guest",
            ["RabbitMQ:Port"] = "5672"
        };
        services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(configuration).Build());

        // Add PostgreSQL database for testing
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql("Host=localhost;Port=5432;Database=identitydb_test;Username=postgres;Password=m@#E$#@550;")
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.MultipleCollectionIncludeWarning)));

        // Add Identity services
        services.AddIdentity<ApplicationUser, Role>()
            .AddEntityFrameworkStores<IdentityDbContext>()
            .AddDefaultTokenProviders();

        // Register MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(TransactionBehavior<,>).Assembly));

        // Register pipeline behaviors
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

        // Register supporting service abstractions
        services.AddScoped<IUserValidator, UserValidator>();
        services.AddScoped<IUserFactory, UserFactory>();
        services.AddScoped<IRoleAssigner, RoleAssigner>();
        services.AddScoped<ITokenGenerator, TokenGenerator>();
        services.AddScoped<IEventPublisher, EventPublisher>();
        services.AddScoped<IMessagePublisher, RabbitMQMessagePublisher>();
        services.AddScoped<DataSeeder>();

        // Register registration strategies
        services.AddScoped<SellerAdminRegistrationStrategy>();
        services.AddScoped<CustomerRegistrationStrategy>();
        services.AddScoped<IRegistrationStrategyFactory, RegistrationStrategyFactory>();

        _serviceProvider = services.BuildServiceProvider();

        // Get the DbContext and migrate the database
        _dbContext = _serviceProvider.GetRequiredService<IdentityDbContext>();
        _dbContext.Database.Migrate();
    }

    private async Task SeedDatabaseAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dataSeeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
        await dataSeeder.SeedAsync();
    }

    [Fact]
    public async Task RegisterCustomer_ShouldReturnSuccess()
    {
        // Arrange
        await SeedDatabaseAsync();
        using var scope = _serviceProvider.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        // Act
        var result = await mediator.Send(new RegisterUserCommand("testcustomer@example.com", "TestPassword123!", "Customer", "Test", "Customer"));

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.NotEqual(Guid.Empty, result.Value.UserId);
    }

    [Fact]
    public async Task RegisterCustomer_WithExistingEmail_ShouldFail()
    {
        // Arrange
        await SeedDatabaseAsync();
        using var scope = _serviceProvider.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        // First registration
        var firstResult = await mediator.Send(new RegisterUserCommand("duplicate@example.com", "TestPassword123!", "Customer", "Test", "User"));
        Assert.True(firstResult.IsSuccess);
        Assert.NotEqual(Guid.Empty, firstResult.Value.UserId);

        // Second registration with same email should fail
        var secondResult = await mediator.Send(new RegisterUserCommand("duplicate@example.com", "TestPassword123!", "Customer", "Test", "User"));
        Assert.True(secondResult.IsFailure);
        Assert.Contains("already exists", secondResult.Error);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
