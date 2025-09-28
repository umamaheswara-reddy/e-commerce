# Identity Service - User Registration Strategy Pattern Implementation

This document describes the refactored user registration system that implements the Strategy Pattern to handle role-specific registration flows for SellerAdmin and Customer roles.

## Overview

The registration system has been refactored from a monolithic `RegistrationService` to a flexible Strategy Pattern implementation that separates concerns and allows for easy extension of new roles.

## Architecture

### Core Components

- **IRegistrationStrategy**: Defines the contract for role-specific registration strategies
- **IRegistrationStrategyFactory**: Factory interface for creating appropriate strategies based on role
- **UserRegistrationCoordinator**: Orchestrates the registration process by delegating to the correct strategy
- **SellerAdminRegistrationStrategy**: Handles SellerAdmin-specific registration logic
- **CustomerRegistrationStrategy**: Handles Customer-specific registration logic

### File Structure

```
services/identity-service/src/Identity.Application/Services/
├── IRegistrationService.cs
├── IRegistrationStrategy.cs
├── IRegistrationStrategyFactory.cs
├── UserRegistrationCoordinator.cs (formerly RegistrationService)
├── RegistrationStrategyFactory.cs
├── SellerAdminRegistrationStrategy.cs
└── CustomerRegistrationStrategy.cs
```

## Strategy Details

### SellerAdminRegistrationStrategy
- **Tenant Handling**: Automatically generates a new `TenantId` (GUID) for each SellerAdmin registration
- **Validation**: Ensures SellerAdmin is associated with a tenant
- **Token Generation**: Includes `tenantId` claim in JWT token
- **Event Publishing**: Publishes `AccountRegisteredEvent` with tenant information

### CustomerRegistrationStrategy
- **Tenant Handling**: No tenant association (TenantId remains null)
- **Validation**: Ensures Customer has no tenant association
- **Token Generation**: Standard JWT token without tenant claims
- **Event Publishing**: Publishes `AccountRegisteredEvent` without tenant information

### SuperAdmin Exclusion
SuperAdmin registration is intentionally excluded from this strategy-based flow. SuperAdmin accounts are provisioned during application startup via the `DataSeeder` service and are not available through the public registration API.

## Dependency Injection Configuration

The following services are registered in `Program.cs`:

```csharp
builder.Services.AddScoped<IRegistrationService, UserRegistrationCoordinator>();
builder.Services.AddScoped<IRegistrationStrategyFactory, RegistrationStrategyFactory>();
builder.Services.AddScoped<SellerAdminRegistrationStrategy>();
builder.Services.AddScoped<CustomerRegistrationStrategy>();
```

## How Strategies Are Wired

1. **Factory Pattern**: The `RegistrationStrategyFactory` uses `IServiceProvider` to resolve strategies dynamically
2. **Strategy Selection**: Based on the `Role` field in `RegisterRequestDto`
3. **Error Handling**: Invalid roles (including SuperAdmin) throw `InvalidOperationException`

## Adding New Roles

To add a new role (e.g., "Manager"):

1. **Create Strategy Class**:
   ```csharp
   public class ManagerRegistrationStrategy : IRegistrationStrategy
   {
       // Implement role-specific logic
   }
   ```

2. **Register in DI**:
   ```csharp
   builder.Services.AddScoped<ManagerRegistrationStrategy>();
   ```

3. **Update Factory**:
   ```csharp
   public IRegistrationStrategy GetStrategy(string role)
   {
       return role switch
       {
           "SellerAdmin" => _serviceProvider.GetRequiredService<SellerAdminRegistrationStrategy>(),
           "Customer" => _serviceProvider.GetRequiredService<CustomerRegistrationStrategy>(),
           "Manager" => _serviceProvider.GetRequiredService<ManagerRegistrationStrategy>(),
           // ... other cases
       };
   }
   ```

## Benefits

- **Single Responsibility**: Each strategy handles one role's specific logic
- **Open/Closed Principle**: New roles can be added without modifying existing code
- **Testability**: Strategies can be unit tested in isolation
- **Maintainability**: Role-specific logic is encapsulated and easy to modify
- **Separation of Concerns**: Common orchestration logic is separated from role-specific logic

## Usage

The registration flow remains the same from the API consumer's perspective:

```csharp
var registrationService = serviceProvider.GetRequiredService<IRegistrationService>();
var result = await registrationService.RegisterUserAsync(request);
```

The coordinator automatically selects and delegates to the appropriate strategy based on `request.Role`.

## Error Handling

- **Unsupported Roles**: Attempting to register with SuperAdmin or unknown roles throws `InvalidOperationException`
- **Validation Failures**: Role-specific validation errors are returned in `RegisterResponseDto`
- **Logging**: All registration attempts and outcomes are logged for monitoring

## Future Extensions

The pattern supports easy extension for:
- Additional role types
- Role-specific validation rules
- Custom event publishing per role
- Integration with external systems per role
- Different token generation strategies per role
