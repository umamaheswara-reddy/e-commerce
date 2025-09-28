using Identity.Application.Abstractions;
using MediatR;

namespace Identity.Application.Registration.Commands;

public record RegisterUserCommand(string Email, string Password, string Role, string FirstName, string LastName) : IRequest<Guid>, ICommand;
