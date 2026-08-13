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

    // POST /api/meals  — body: { "recipeId": "...", "mealName": "..." }
    [Function("AddMeal")]
    public async Task<IActionResult> Add(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "meals")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<MealEntity>(req.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (body is null || string.IsNullOrWhiteSpace(body.RecipeId))
            return new BadRequestObjectResult("RecipeId is required.");

        body.RowKey = Guid.NewGuid().ToString();
        body.PartitionKey = "meal";

        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();
        await client.AddEntityAsync(body);

        logger.LogInformation("Meal added: {Name}", body.MealName);
        return new CreatedResult($"/api/meals/{body.RowKey}", body);
    }

    // PATCH /api/meals/{id}/cast  — marks a meal as cast to MagicMirror
    [Function("CastMeal")]
    public async Task<IActionResult> Cast(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "meals/{id}/cast")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<MealEntity>("meal", id);
            var meal = entity.Value;
            meal.Cast = true;
            await client.UpdateEntityAsync(meal, meal.ETag);
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
