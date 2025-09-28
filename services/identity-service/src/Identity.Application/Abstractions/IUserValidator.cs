using Identity.Application.Registration.DTOs;

namespace Identity.Application.Abstractions;

public interface IUserValidator
{
    Task<ValidationResult> ValidateAsync(RegisterRequestDto request);
}

public class ValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }

    public static ValidationResult Success() => new() { IsValid = true };
    public static ValidationResult Failure(string message) => new() { IsValid = false, ErrorMessage = message };
}
