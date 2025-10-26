using ECommerce.Common.Abstractions;
using Identity.Application.Login.DTOs;
using MediatR;

namespace Identity.Application.Login.Commands;

public record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponseDto>>;
