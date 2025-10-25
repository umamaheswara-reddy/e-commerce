using ECommerce.Common.Abstractions;
using ECommerce.Common.Constants;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Reflection;

namespace ECommerce.Common.Behaviors;

public class ExceptionHandlingBehavior<TRequest, TResponse>(
    ILogger<ExceptionHandlingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    where TResponse : class
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        try
        {
            return await next(cancellationToken);
        }
        catch (ApplicationExceptionBase ex)
        {
            logger.LogWarning(ex, "Business rule violation in {RequestType}", typeof(TRequest).Name);

            if (typeof(TResponse).IsGenericType &&
                typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
            {
                var resultType = typeof(TResponse).GetGenericArguments()[0];
                var failureMethod = typeof(Result<>)
                    .MakeGenericType(resultType)
                    .GetMethod(nameof(Result<object>.Failure), BindingFlags.Public | BindingFlags.Static)!;

                return (TResponse)failureMethod.Invoke(null, new object?[] { ex.Message, ex.ErrorCode, 0 })!;
            }

            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error in {RequestType}", typeof(TRequest).Name);

            if (typeof(TResponse).IsGenericType &&
                typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
            {
                var resultType = typeof(TResponse).GetGenericArguments()[0];
                var failureMethod = typeof(Result<>)
                    .MakeGenericType(resultType)
                    .GetMethod(nameof(Result<object>.Failure), BindingFlags.Public | BindingFlags.Static)!;

                return (TResponse)failureMethod.Invoke(null, new object?[] { "An unexpected error occurred. Please try again later.", ErrorCodes.InternalError, 0 })!;
            }

            throw;
        }
    }
}
