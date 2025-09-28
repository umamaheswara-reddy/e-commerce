using Identity.Application.Abstractions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using MediatR;

namespace Identity.Infrastructure.Behaviors;

public class TransactionBehavior<TRequest, TResponse>(IdentityDbContext dbContext, IMediator mediator) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IdentityDbContext _dbContext = dbContext;
    private readonly IMediator _mediator = mediator;

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

            // Collect and dispatch domain events from all tracked entities
            var domainEvents = _dbContext.GetDomainEvents<object>().ToList();

            foreach (var domainEvent in domainEvents)
            {
                await _mediator.Publish(domainEvent);
            }

            // Clear domain events from all tracked entities
            _dbContext.ClearDomainEvents<object>();

            return response;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
