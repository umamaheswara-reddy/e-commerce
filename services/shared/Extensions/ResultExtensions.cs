using ECommerce.Common.Abstractions;
using ECommerce.Common.Responses;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Common.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(new ApiResponse<T>
            {
                Success = true,
                Data = result.Value,
                StatusCode = 200
            });
        }

        return new ObjectResult(new ApiResponse
        {
            Success = false,
            Errors = result.Error ?? "An error occurred.",
            StatusCode = result.StatusCode
        })
        {
            StatusCode = result.StatusCode
        };
    }

    public static IActionResult ToActionResult(this Result result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(new ApiResponse
            {
                Success = true,
                StatusCode = 200
            });
        }

        return new ObjectResult(new ApiResponse
        {
            Success = false,
            Errors = result.Error ?? "An error occurred.",
            StatusCode = result.StatusCode
        })
        {
            StatusCode = result.StatusCode
        };
    }
}
