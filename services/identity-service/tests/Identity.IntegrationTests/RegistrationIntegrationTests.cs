using Identity.Application.Abstractions;
using Identity.Application.Registration;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.DTOs;
using Identity.Application.Registration.Factories;
using Identity.Application.Registration.Strategies;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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

        // Register application services
        services.AddScoped<IRegistrationService, UserRegistrationCoordinator>();
        services.AddScoped<IRegistrationStrategyFactory, RegistrationStrategyFactory>();
        services.AddScoped<SellerAdminRegistrationStrategy>();
        services.AddScoped<CustomerRegistrationStrategy>();

        // Register supporting service abstractions
        services.AddScoped<IUserValidator, UserValidator>();
        services.AddScoped<IUserFactory, UserFactory>();
        services.AddScoped<IRoleAssigner, RoleAssigner>();
        services.AddScoped<ITokenGenerator, TokenGenerator>();
        services.AddScoped<IEventPublisher, EventPublisher>();
        services.AddScoped<IMessagePublisher, RabbitMQMessagePublisher>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<DataSeeder>();

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
        var registrationService = scope.ServiceProvider.GetRequiredService<IRegistrationService>();

        var request = new RegisterRequestDto
        {
            Email = "testcustomer@example.com",
            Password = "TestPassword123!",
            FirstName = "Test",
            LastName = "Customer",
            Role = "Customer"
        };

        // Act
        var result = await registrationService.RegisterUserAsync(request);

        // Assert
        Assert.NotNull(result);
        if (!result.Success)
        {
            // Debug: print the actual error message
            System.Console.WriteLine($"Registration failed: {result.Message}");
        }
        Assert.True(result.Success, $"Registration failed: {result.Message}");
        Assert.Equal("Registration successful.", result.Message);
        Assert.NotEqual(Guid.Empty, result.UserId);
    }

    [Fact]
    public async Task RegisterCustomer_WithExistingEmail_ShouldFail()
    {
        // Arrange
        await SeedDatabaseAsync();
        using var scope = _serviceProvider.CreateScope();
        var registrationService = scope.ServiceProvider.GetRequiredService<IRegistrationService>();

        var request = new RegisterRequestDto
        {
            Email = "duplicate@example.com",
            Password = "TestPassword123!",
            FirstName = "Test",
            LastName = "Customer",
            Role = "Customer"
        };

        // First registration
        var firstResult = await registrationService.RegisterUserAsync(request);
        Assert.True(firstResult.Success);

        // Second registration with same email
        var secondResult = await registrationService.RegisterUserAsync(request);

        // Assert
        Assert.NotNull(secondResult);
        Assert.False(secondResult.Success);
        Assert.Contains("already exists", secondResult.Message);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
