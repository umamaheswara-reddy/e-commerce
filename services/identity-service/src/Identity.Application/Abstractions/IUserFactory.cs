using Identity.Domain.Entities;

namespace Identity.Application.Abstractions;

public interface IUserFactory
{
    Task<UserCreationResult> CreateUserAsync(string email, string password, Guid? tenantId = null);
}

public class UserCreationResult
{
    public bool Succeeded { get; set; }
    public ApplicationUser? User { get; set; }
    public IEnumerable<string> Errors { get; set; } = new List<string>();
}
