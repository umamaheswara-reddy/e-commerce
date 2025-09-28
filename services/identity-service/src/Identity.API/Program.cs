using Identity.Application.Abstractions;
using Identity.Application.Behaviors;
using Identity.Application.Registration;
using Identity.Application.Registration.Abstractions;
using Identity.Application.Registration.Factories;
using Identity.Application.Registration.Strategies;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<IdentityDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("IdentityDb");
    options.UseNpgsql(connectionString);
});

builder.Services.AddIdentity<ApplicationUser, Role>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();


// Register supporting service abstractions
builder.Services.AddScoped<IUserValidator, UserValidator>();
builder.Services.AddScoped<IUserFactory, UserFactory>();
builder.Services.AddScoped<IRoleAssigner, RoleAssigner>();
builder.Services.AddScoped<ITokenGenerator, TokenGenerator>();
builder.Services.AddScoped<IEventPublisher, EventPublisher>();

// Register strategy factory and strategies (needed for RegisterUserCommandHandler)
builder.Services.AddScoped<IRegistrationStrategyFactory, RegistrationStrategyFactory>();
builder.Services.AddScoped<SellerAdminRegistrationStrategy>();
builder.Services.AddScoped<CustomerRegistrationStrategy>();

builder.Services.AddScoped<IMessagePublisher, RabbitMQMessagePublisher>();
builder.Services.AddScoped<DataSeeder>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("https://localhost:4200", "http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register MediatR
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(TransactionBehavior<,>).Assembly);
});

// Register pipeline behaviors
builder.Services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

var app = builder.Build();

// Seed data on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dataSeeder = services.GetRequiredService<DataSeeder>();
        await dataSeeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularDev");
app.UseAuthorization();
app.MapControllers();

app.Run();
