using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SharedKitchenApi.Models;
using System.Text.Json;

namespace SharedKitchenApi.Functions;

public class MealsFunctions(TableServiceClient tableService, ILogger<MealsFunctions> logger)
{
    private const string TableName = "meals";

    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNameCaseInsensitive = true };

    // GET /api/meals
    [Function("GetMeals")]
    public async Task<IActionResult> GetAll(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "meals")] HttpRequest req)
    {
        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();

        var meals = new List<MealEntity>();
        await foreach (var entity in client.QueryAsync<MealEntity>(m => m.PartitionKey == "meal"))
            meals.Add(entity);

        return new OkObjectResult(meals.OrderBy(m => m.MealName).ToList());
    }

    // GET /api/meals/{id}
    [Function("GetMeal")]
    public async Task<IActionResult> GetOne(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "meals/{id}")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<MealEntity>("meal", id);
            return new OkObjectResult(entity.Value);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }

    // POST /api/meals — add a recipe to the meals list
    [Function("AddMeal")]
    public async Task<IActionResult> Add(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "meals")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<MealEntity>(req.Body, JsonOpts);

        if (body is null || string.IsNullOrWhiteSpace(body.RecipeId))
            return new BadRequestObjectResult("RecipeId is required.");

        body.RowKey = Guid.NewGuid().ToString();
        body.PartitionKey = "meal";

        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();
        await client.AddEntityAsync(body);

        logger.LogInformation("Meal added: {Name}", body.MealName);
        return new CreatedAtRouteResult("GetMeal", new { id = body.RowKey }, body);
    }

    // PATCH /api/meals/{id} — partial update, e.g. { "cast": true }
    [Function("PatchMeal")]
    public async Task<IActionResult> Patch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "meals/{id}")] HttpRequest req,
        string id)
    {
        var patch = await JsonSerializer.DeserializeAsync<MealPatch>(req.Body, JsonOpts);
        if (patch is null)
            return new BadRequestObjectResult("Request body is required.");

        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<MealEntity>("meal", id);
            var meal = entity.Value;

            if (patch.Cast.HasValue) meal.Cast = patch.Cast.Value;
            if (patch.MealName is not null) meal.MealName = patch.MealName;

            await client.UpdateEntityAsync(meal, meal.ETag, TableUpdateMode.Merge);
            return new OkObjectResult(meal);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }

    // DELETE /api/meals/{id}
    [Function("DeleteMeal")]
    public async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "meals/{id}")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            await client.DeleteEntityAsync("meal", id);
            return new NoContentResult();
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }
}

/// <summary>Payload for PATCH /api/meals/{id}. Only provided fields are applied.</summary>
public record MealPatch(string? MealName, bool? Cast);
