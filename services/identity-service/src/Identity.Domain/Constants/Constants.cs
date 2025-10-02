namespace Identity.Domain.Constants;
public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string SellerAdmin = "SellerAdmin";
    public const string Customer = "Customer";
}

public static class ErrorCodes
{
    public const string ValidationFailed = "ValidationFailed";
    public const string InvalidRole = "InvalidRole";
    public const string UserCreationFailed = "UserCreationFailed";
    public const string RoleAssignmentFailed = "RoleAssignmentFailed";
    public const string InternalError = "InternalError";
    public const string NotFound = "NotFound";
    public const string Unauthorized = "Unauthorized";
}

public static class ErrorStatusCodes
{
    public static int GetStatusCode(string errorCode) => errorCode switch
    {
        ErrorCodes.ValidationFailed => 400,
        ErrorCodes.InvalidRole => 400,
        ErrorCodes.UserCreationFailed => 409, // Conflict, assuming user already exists
        ErrorCodes.RoleAssignmentFailed => 500,
        ErrorCodes.InternalError => 500,
        ErrorCodes.NotFound => 404,
        ErrorCodes.Unauthorized => 401,
        _ => 400
    };
}
