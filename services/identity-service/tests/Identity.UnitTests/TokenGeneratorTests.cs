using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Identity.UnitTests;

public class TokenGeneratorTests
{
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<TokenGenerator>> _loggerMock;
    private readonly TokenGenerator _generator;

    public TokenGeneratorTests()
    {
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<TokenGenerator>>();

        // Setup JWT configuration
        _configurationMock.SetupGet(c => c["Jwt:Key"]).Returns("test-secret-key-that-is-long-enough-for-hmac-sha256");
        _configurationMock.SetupGet(c => c["Jwt:Issuer"]).Returns("test-issuer");
        _configurationMock.SetupGet(c => c["Jwt:Audience"]).Returns("test-audience");

        _generator = new TokenGenerator(_configurationMock.Object);
    }

    [Fact]
    public void GenerateToken_ShouldGenerateTokenWithTenantId_WhenUserHasTenantId()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            TenantId = Guid.NewGuid()
        };
        var role = "SellerAdmin";

        // Act
        var token = _generator.GenerateToken(user, role);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        // Verify token can be read
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Equal("test-issuer", jwtToken.Issuer);
        Assert.Equal("test-audience", jwtToken.Audiences.First());

        var claims = jwtToken.Claims.ToList();
        Assert.Contains(claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
        Assert.Contains(claims, c => c.Type == JwtRegisteredClaimNames.Email && c.Value == user.Email);
        Assert.Contains(claims, c => c.Type == "role" && c.Value == role);
        Assert.Contains(claims, c => c.Type == "tenantId" && c.Value == user.TenantId.ToString());
        Assert.Contains(claims, c => c.Type == JwtRegisteredClaimNames.Jti);
    }

    [Fact]
    public void GenerateToken_ShouldGenerateTokenWithoutTenantId_WhenUserHasNoTenantId()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            TenantId = null
        };
        var role = "Customer";

        // Act
        var token = _generator.GenerateToken(user, role);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        // Verify token can be read
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Equal("test-issuer", jwtToken.Issuer);
        Assert.Equal("test-audience", jwtToken.Audiences.First());

        var claims = jwtToken.Claims.ToList();
        Assert.Contains(claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
        Assert.Contains(claims, c => c.Type == JwtRegisteredClaimNames.Email && c.Value == user.Email);
        Assert.Contains(claims, c => c.Type == "role" && c.Value == role);
        Assert.Contains(claims, c => c.Type == JwtRegisteredClaimNames.Jti);

        // Should not contain tenantId claim
        Assert.DoesNotContain(claims, c => c.Type == "tenantId");
    }

    [Fact]
    public void GenerateToken_ShouldIncludeAllRequiredClaims()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            TenantId = Guid.NewGuid()
        };
        var role = "SellerAdmin";

        // Act
        var token = _generator.GenerateToken(user, role);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Check that all expected claims are present
        var claims = jwtToken.Claims.ToDictionary(c => c.Type, c => c.Value);

        Assert.True(claims.ContainsKey(JwtRegisteredClaimNames.Sub));
        Assert.True(claims.ContainsKey(JwtRegisteredClaimNames.Email));
        Assert.True(claims.ContainsKey("role"));
        Assert.True(claims.ContainsKey(JwtRegisteredClaimNames.Jti));
        Assert.True(claims.ContainsKey("tenantId"));

        // Check specific values
        Assert.Equal(user.Id.ToString(), claims[JwtRegisteredClaimNames.Sub]);
        Assert.Equal(user.Email, claims[JwtRegisteredClaimNames.Email]);
        Assert.Equal(role, claims["role"]);
        Assert.Equal(user.TenantId.ToString(), claims["tenantId"]);
    }

    [Fact]
    public void GenerateToken_ShouldHaveValidExpiration()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };
        var role = "Customer";
        var beforeGeneration = DateTime.UtcNow;

        // Act
        var token = _generator.GenerateToken(user, role);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.True(jwtToken.ValidTo > beforeGeneration);

        // Should expire in 7 days
        var expectedExpiration = beforeGeneration.AddDays(7);
        Assert.True(jwtToken.ValidTo <= expectedExpiration.AddMinutes(1)); // Allow small margin
        Assert.True(jwtToken.ValidTo >= expectedExpiration.AddMinutes(-1));
    }
}
