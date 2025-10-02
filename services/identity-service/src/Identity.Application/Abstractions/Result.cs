using Identity.Domain.Constants;

namespace Identity.Application.Abstractions;

public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }
    public string? Code { get; }
    public int StatusCode { get; }

    protected Result(bool isSuccess, string? error, string? code, int statusCode)
    {
        IsSuccess = isSuccess;
        Error = error;
        Code = code;
        StatusCode = statusCode;
    }

    public static Result Success() => new(true, null, null, 200);

    public static Result Failure(string error, string code, int statusCode = 0)
    {
        if (statusCode == 0 && code != null)
        {
            statusCode = ErrorStatusCodes.GetStatusCode(code);
        }
        else if (statusCode == 0)
        {
            statusCode = 400;
        }
        return new(false, error, code, statusCode);
    }
}

public class Result<T> : Result
{
    public T? Value { get; }

    private Result(bool isSuccess, T? value, string? error, string? code, int statusCode)
        : base(isSuccess, error, code, statusCode)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(true, value, null, null, 200);

    public static new Result<T> Failure(string error, string code, int statusCode = 0)
    {
        if (statusCode == 0 && code != null)
        {
            statusCode = ErrorStatusCodes.GetStatusCode(code);
        }
        else if (statusCode == 0)
        {
            statusCode = 400;
        }
        return new(false, default, error, code, statusCode);
    }

    public static implicit operator Result<T>(T value) => Success(value);
}
