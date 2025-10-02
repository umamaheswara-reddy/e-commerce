namespace Identity.API.Controllers;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public int StatusCode { get; set; }
}

public class ApiResponse
{
    public bool Success { get; set; }
    public object? Errors { get; set; }
    public int StatusCode { get; set; }
}
