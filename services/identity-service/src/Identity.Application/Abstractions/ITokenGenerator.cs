using Identity.Domain.Entities;

namespace Identity.Application.Abstractions;

public interface ITokenGenerator
{
    string GenerateToken(ApplicationUser user, string role);
}
