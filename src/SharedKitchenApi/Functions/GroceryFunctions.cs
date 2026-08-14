using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SharedKitchenApi.Models;
using System.Text.Json;

namespace SharedKitchenApi.Functions;

public class GroceryFunctions(TableServiceClient tableService, ILogger<GroceryFunctions> logger)
{
    private const string TableName = "groceries";

    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNameCaseInsensitive = true };

    // GET /api/groceries
    [Function("GetGroceries")]
    public async Task<IActionResult> GetAll(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "groceries")] HttpRequest req)
    {
        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();

        var items = new List<GroceryEntity>();
        await foreach (var entity in client.QueryAsync<GroceryEntity>(g => g.PartitionKey == "grocery"))
            items.Add(entity);

        return new OkObjectResult(items.OrderBy(g => g.Name).ToList());
    }

    // GET /api/groceries/{id}
    [Function("GetGrocery")]
    public async Task<IActionResult> GetOne(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "groceries/{id}")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<GroceryEntity>("grocery", id);
            return new OkObjectResult(entity.Value);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }

    // POST /api/groceries — add an item to the shopping list
    [Function("AddGrocery")]
    public async Task<IActionResult> Add(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "groceries")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<GroceryEntity>(req.Body, JsonOpts);

        if (body is null || string.IsNullOrWhiteSpace(body.Name))
            return new BadRequestObjectResult("Grocery item name is required.");

        body.RowKey = Guid.NewGuid().ToString();
        body.PartitionKey = "grocery";

        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();
        await client.AddEntityAsync(body);

        logger.LogInformation("Grocery added: {Name}", body.Name);
        return new CreatedAtRouteResult("GetGrocery", new { id = body.RowKey }, body);
    }

    // PATCH /api/groceries/{id} — partial update, e.g. { "checked": true } or { "quantity": "3L" }
    [Function("PatchGrocery")]
    public async Task<IActionResult> Patch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "groceries/{id}")] HttpRequest req,
        string id)
    {
        var patch = await JsonSerializer.DeserializeAsync<GroceryPatch>(req.Body, JsonOpts);
        if (patch is null)
            return new BadRequestObjectResult("Request body is required.");

        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<GroceryEntity>("grocery", id);
            var item = entity.Value;

            if (patch.Checked.HasValue) item.Checked = patch.Checked.Value;
            if (patch.Name is not null) item.Name = patch.Name;
            if (patch.Quantity is not null) item.Quantity = patch.Quantity;

            await client.UpdateEntityAsync(item, item.ETag, TableUpdateMode.Merge);
            return new OkObjectResult(item);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }

    // DELETE /api/groceries/{id}
    [Function("DeleteGrocery")]
    public async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "groceries/{id}")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            await client.DeleteEntityAsync("grocery", id);
            return new NoContentResult();
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new NotFoundResult();
        }
    }
}

/// <summary>Payload for PATCH /api/groceries/{id}. Only provided fields are applied.</summary>
public record GroceryPatch(string? Name, string? Quantity, bool? Checked);
