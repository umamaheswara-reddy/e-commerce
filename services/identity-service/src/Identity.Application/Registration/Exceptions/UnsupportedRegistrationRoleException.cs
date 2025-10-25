using ECommerce.Common.Abstractions;
using Identity.Domain.Constants;

namespace Identity.Application.Registration.Exceptions;

public class UnsupportedRegistrationRoleException : ApplicationExceptionBase
{
    private UnsupportedRegistrationRoleException(string message)
        : base(message, ErrorCodes.InvalidRole) { }

    public static UnsupportedRegistrationRoleException ForRole(string role)
        => new($"Registration is not supported for role: {role}");

    public static UnsupportedRegistrationRoleException Custom(string message)
        => new(message);
}
