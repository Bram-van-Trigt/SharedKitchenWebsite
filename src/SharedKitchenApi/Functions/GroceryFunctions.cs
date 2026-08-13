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

    // POST /api/groceries
    [Function("AddGrocery")]
    public async Task<IActionResult> Add(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "groceries")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<GroceryEntity>(req.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (body is null || string.IsNullOrWhiteSpace(body.Name))
            return new BadRequestObjectResult("Grocery item name is required.");

        body.RowKey = Guid.NewGuid().ToString();
        body.PartitionKey = "grocery";

        var client = tableService.GetTableClient(TableName);
        await client.CreateIfNotExistsAsync();
        await client.AddEntityAsync(body);

        logger.LogInformation("Grocery added: {Name}", body.Name);
        return new CreatedResult($"/api/groceries/{body.RowKey}", body);
    }

    // PATCH /api/groceries/{id}/check  — toggle checked status
    [Function("CheckGrocery")]
    public async Task<IActionResult> Check(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "groceries/{id}/check")] HttpRequest req,
        string id)
    {
        var client = tableService.GetTableClient(TableName);
        try
        {
            var entity = await client.GetEntityAsync<GroceryEntity>("grocery", id);
            var item = entity.Value;
            item.Checked = !item.Checked;
            await client.UpdateEntityAsync(item, item.ETag);
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
