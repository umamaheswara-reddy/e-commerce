using ECommerce.Common;
using ECommerce.Common.Extensions;
using Identity.Application.Registration.Commands;
using Identity.Application.Registration.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _mediator.Send(new RegisterUserCommand(request.Email, request.Password, request.Role, request.FirstName, request.LastName));

        return result.ToActionResult();
    }
}
