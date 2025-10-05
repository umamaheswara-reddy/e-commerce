using ECommerce.Common.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Common.Infrastructure.Services;
public sealed class DomainEventDispatcher(IMediator mediator)
{
    private readonly IMediator _mediator = mediator;

    public async Task DispatchEventsAsync(DbContext dbContext)
    {
        var entitiesWithEvents = dbContext.ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        foreach (var entity in entitiesWithEvents)
        {
            var events = entity.DomainEvents.ToList();
            entity.ClearDomainEvents();

            foreach (var domainEvent in events)
            {
                await _mediator.Publish(domainEvent);
            }
        }
    }
}
