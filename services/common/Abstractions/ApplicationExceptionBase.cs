namespace ECommerce.Common.Abstractions;

public abstract class ApplicationExceptionBase : Exception
{
    public string ErrorCode { get; }

    protected ApplicationExceptionBase(string message, string errorCode)
        : base(message)
    {
        ErrorCode = errorCode;
    }
}
