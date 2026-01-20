using ECommerce.Common.Abstractions;
using ECommerce.Common.Constants;
using Identity.Application.Abstractions;
using Identity.Application.Login.DTOs;
using Identity.Domain.Entities;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Login.Commands;

public class LoginCommandHandler(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITokenGenerator tokenGenerator,
    ILogger<LoginCommandHandler> logger) : IRequestHandler<LoginCommand, Result<LoginResponseDto>>
{
    public async Task<Result<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result<LoginResponseDto>.Failure("Invalid email or password.",ErrorCodes.Unauthorized);
        }

        var result = await signInManager.PasswordSignInAsync(user, request.Password, false, false);
        if (!result.Succeeded)
        {
            return Result<LoginResponseDto>.Failure("Invalid email or password.", ErrorCodes.Unauthorized);
        }

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        var token = tokenGenerator.GenerateToken(user, role);

        var response = user.Adapt<LoginResponseDto>();
        response.Message = "Login successful.";
        response.Token = token;
        response.User = user.Adapt<UserDto>();
        response.User.Name = user.UserName ?? user.Email ?? string.Empty;
        response.User.Role = role;

        return Result<LoginResponseDto>.Success(response);
    }
}
