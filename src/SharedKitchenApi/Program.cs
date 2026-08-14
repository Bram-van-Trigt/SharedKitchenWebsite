using Azure.Data.Tables;
using Azure.Identity;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Register TableServiceClient using Managed Identity in Azure,
        // or DefaultAzureCredential for local development (az login).
        services.AddSingleton(sp =>
        {
            var endpoint = Environment.GetEnvironmentVariable("StorageTableEndpoint")
                ?? throw new InvalidOperationException("StorageTableEndpoint is not configured.");
            return new TableServiceClient(new Uri(endpoint), new DefaultAzureCredential());
        });
    })
    .Build();

host.Run();
