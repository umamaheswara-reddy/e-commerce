using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace ECommerce.Common.Swagger;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwagger(this IServiceCollection services, IConfiguration config, string serviceName)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = $"{serviceName} API",
                Version = "v1",
                Description = $"Swagger for {serviceName} microservice"
            });

            // Include XML documentation if available
            var xmlFile = $"{AppDomain.CurrentDomain.FriendlyName}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath);

            // Enable JWT Bearer Token Authentication in Swagger UI
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter 'Bearer {token}'"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }

    public static IApplicationBuilder UseSwagger(this IApplicationBuilder app, IConfiguration config, string serviceName)
    {
        app.UseSwagger();

        app.UseSwaggerUI(options =>
        {
            var basePath = config["Swagger:BasePath"] ?? string.Empty;
            options.SwaggerEndpoint($"{basePath}/swagger/v1/swagger.json", $"{serviceName} API v1");
            options.RoutePrefix = string.Empty; // Swagger at root
        });

        return app;
    }
}
