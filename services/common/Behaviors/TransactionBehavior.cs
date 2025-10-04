using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Windows.Input;

namespace ECommerce.Common.Behaviors;

public class TransactionBehavior<TRequest, TResponse>(DbContext dbContext) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly DbContext _dbContext = dbContext;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Only wrap commands in transactions, not queries
        if (request is not ICommand)
        {
            return await next();
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var response = await next();
            await transaction.CommitAsync(cancellationToken);

            return response;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
