namespace ECommerce.Common.Swagger;

public class SwaggerOptions
{
    public string Title { get; set; } = "API";
    public string Version { get; set; } = "v1";
    public string Description { get; set; } = "";
    public string RoutePrefix { get; set; } = string.Empty;
}
