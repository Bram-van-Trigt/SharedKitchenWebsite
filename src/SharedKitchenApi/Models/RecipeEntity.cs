using Azure.Data.Tables;

namespace SharedKitchenApi.Models;

/// <summary>
/// A recipe stored in Azure Table Storage.
/// PartitionKey = "recipe", RowKey = Guid (recipe ID).
/// </summary>
public class RecipeEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "recipe";
    public string RowKey { get; set; } = Guid.NewGuid().ToString();
    public DateTimeOffset? Timestamp { get; set; }
    public Azure.ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PreparationTimeMinutes { get; set; }
    public int CookingTimeMinutes { get; set; }
    public int Persons { get; set; }
    public string Instructions { get; set; } = string.Empty;
    /// <summary>Ingredients stored as "ingredient:quantity,ingredient:quantity" for simplicity.</summary>
    public string Ingredients { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    /// <summary>Optional blob URL of the recipe image.</summary>
    public string ImageUrl { get; set; } = string.Empty;
}
