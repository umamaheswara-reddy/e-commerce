using ECommerce.Common.Abstractions;
using ECommerce.Common.Constants;

public abstract class RabbitMqExceptionBase : ApplicationExceptionBase
{
    protected RabbitMqExceptionBase(string message, string errorCode) : base(message, errorCode) { }
}

public class RabbitMqAuthenticationException : RabbitMqExceptionBase
{
    public RabbitMqAuthenticationException() : base("RabbitMQ authentication failed. Please check your credentials.", ErrorCodes.Unauthorized) { }
}

public class RabbitMqUnreachableException : RabbitMqExceptionBase
{
    public RabbitMqUnreachableException() : base("RabbitMQ server is unreachable. Please check your network or host configuration.", ErrorCodes.Unavailable) { }
}
