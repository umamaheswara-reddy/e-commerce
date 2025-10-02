using Identity.Application.Abstractions;
using Identity.Application.Registration.DTOs;
using MediatR;

namespace Identity.Application.Registration.Commands;

public record RegisterUserCommand(string Email, string Password, string Role, string FirstName, string LastName) : IRequest<Result<RegisterResponseDto>>, ICommand;
