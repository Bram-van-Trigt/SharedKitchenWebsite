using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SharedKitchenApi.Models;
using System.Text.Json;

namespace SharedKitchenApi.Functions;

public class RecipesFunctions(TableServiceClient tableService, ILogger<RecipesFunctions> logger)
{
    private const string TableName = "recipes";

    // GET /api/recipes
    [Function("GetRecipes")]
    public async Task<IActionResult> GetAll(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "recipes")] HttpRequest req)
    {
        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();

        var recipes = new List<RecipeEntity>();
        await foreach (var entity in client.QueryAsync<RecipeEntity>(r => r.PartitionKey == "recipe"))
            recipes.Add(entity);

        recipes = [.. recipes.OrderBy(r => r.Name)];
        return new OkObjectResult(recipes);
    }

    // GET /api/recipes/{id}
    [Function("GetRecipe")]
    public async Task<IActionResult> GetOne(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "recipes/{id}")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<RecipeEntity>("recipe", id);
            return new OkObjectResult(entity.Value);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }

    // POST /api/recipes
    [Function("CreateRecipe")]
    public async Task<IActionResult> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "recipes")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<RecipeEntity>(req.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (body is null || string.IsNullOrWhiteSpace(body.Name))
            return new BadRequestObjectResult("Recipe name is required.");

        body.RowKey = Guid.NewGuid().ToString();
        body.PartitionKey = "recipe";

        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();
        await client.AddEntityAsync(body);

        logger.LogInformation("Recipe created: {Name}", body.Name);
        return new CreatedAtRouteResult("GetRecipe", new { id = body.RowKey }, body);
    }

    // DELETE /api/recipes/{id}
    [Function("DeleteRecipe")]
    public async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "recipes/{id}")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            await client.DeleteEntityAsync("recipe", id);
            return new NoContentResult();
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }
}
