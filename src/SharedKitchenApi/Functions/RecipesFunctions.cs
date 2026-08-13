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

    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNameCaseInsensitive = true };

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

        return new OkObjectResult(recipes.OrderBy(r => r.Name).ToList());
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

    // POST /api/recipes — create a new recipe
    [Function("CreateRecipe")]
    public async Task<IActionResult> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "recipes")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<RecipeEntity>(req.Body, JsonOpts);

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

    // PUT /api/recipes/{id} — full replace of an existing recipe
    [Function("UpdateRecipe")]
    public async Task<IActionResult> Update(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "recipes/{id}")] HttpRequest req,
        string id)
    {
        var body = await JsonSerializer.DeserializeAsync<RecipeEntity>(req.Body, JsonOpts);

        if (body is null || string.IsNullOrWhiteSpace(body.Name))
            return new BadRequestObjectResult("Recipe name is required.");

        body.RowKey = id;
        body.PartitionKey = "recipe";

        var client = tableService.GetTableClient(TableName);
        try
        {
            // ReplaceEntity performs a full replace (idempotent)
            await client.UpdateEntityAsync(body, Azure.ETag.All, TableUpdateMode.Replace);
            return new OkObjectResult(body);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
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
