using Azure.Data.Tables;

namespace SharedKitchenApi.Models;

/// <summary>
/// A grocery item on the shared shopping list.
/// PartitionKey = "grocery", RowKey = Guid.
/// </summary>
public class GroceryEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "grocery";
    public string RowKey { get; set; } = Guid.NewGuid().ToString();
    public DateTimeOffset? Timestamp { get; set; }
    public Azure.ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public bool Checked { get; set; }
}
