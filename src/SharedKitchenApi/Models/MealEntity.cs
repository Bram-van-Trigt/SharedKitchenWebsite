using Azure.Data.Tables;

namespace SharedKitchenApi.Models;

/// <summary>
/// A meal (a recipe added to the "what we can cook" list).
/// PartitionKey = "meal", RowKey = Guid (meal ID).
/// </summary>
public class MealEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "meal";
    public string RowKey { get; set; } = Guid.NewGuid().ToString();
    public DateTimeOffset? Timestamp { get; set; }
    public Azure.ETag ETag { get; set; }

    public string MealName { get; set; } = string.Empty;
    /// <summary>References the RowKey of the linked RecipeEntity.</summary>
    public string RecipeId { get; set; } = string.Empty;
    /// <summary>Whether this meal has been cast to the MagicMirror display.</summary>
    public bool Cast { get; set; }
}
