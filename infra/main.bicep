targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment — used to generate unique resource names.')
param environmentName string

@description('Primary location for all resources.')
param location string = 'westeurope'

param apiServiceName string = ''
param apiUserAssignedIdentityName string = ''
param applicationInsightsName string = ''
param appServicePlanName string = ''
param logAnalyticsName string = ''
param resourceGroupName string = ''
param storageAccountName string = ''
param staticWebAppName string = ''

@description('Principal ID of the deployer — used to grant local developer access to storage.')
param principalId string = deployer().objectId

var namePrefix = 'sharedkitchen'
var tags = { 'azd-env-name': environmentName }

var resourceGroupDefaultName = '${namePrefix}-rg-dev'
var managedIdentityDefaultName = '${namePrefix}-id-dev'
var appServicePlanDefaultName = '${namePrefix}-plan-dev'
var storageAccountDefaultName = 'sharedkitchenstdev'
var functionAppDefaultName = '${namePrefix}-func-dev'
var logAnalyticsDefaultName = '${namePrefix}-log-dev'
var applicationInsightsDefaultName = '${namePrefix}-appi-dev'
var staticWebAppDefaultName = '${namePrefix}-swa-dev'
var deploymentStorageContainerName = 'app-package'

// Resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : resourceGroupDefaultName
  location: location
  tags: tags
}

// User-assigned Managed Identity — used by the Function App to access Storage
module apiUserAssignedIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.1' = {
  name: 'apiUserAssignedIdentity'
  scope: rg
  params: {
    location: location
    tags: tags
    name: !empty(apiUserAssignedIdentityName) ? apiUserAssignedIdentityName : managedIdentityDefaultName
  }
}

// Flex Consumption App Service Plan (free tier billing — pay per execution)
module appServicePlan 'br/public:avm/res/web/serverfarm:0.1.1' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : appServicePlanDefaultName
    sku: { name: 'FC1', tier: 'FlexConsumption' }
    reserved: true
    location: location
    tags: tags
  }
}

// Storage Account — holds Table Storage (data) + Blob Storage (deployment + recipe images)
module storage 'br/public:avm/res/storage/storage-account:0.8.3' = {
  name: 'storage'
  scope: rg
  params: {
    name: !empty(storageAccountName) ? storageAccountName : storageAccountDefaultName
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    dnsEndpointType: 'Standard'
    publicNetworkAccess: 'Enabled'
    networkAcls: { defaultAction: 'Allow', bypass: 'AzureServices' }
    blobServices: {
      containers: [
        { name: deploymentStorageContainerName }
        { name: 'recipe-images' }
      ]
    }
    tableServices: {
      tables: [
        { name: 'recipes' }
        { name: 'meals' }
        { name: 'groceries' }
      ]
    }
    minimumTlsVersion: 'TLS1_2'
    location: location
    tags: tags
  }
}

// Storage config flags passed to api.bicep and rbac.bicep
var storageEndpointConfig = {
  enableBlob: true   // deployment container + recipe images
  enableQueue: false
  enableTable: true  // recipes, meals, groceries
  enableFiles: false
  allowUserIdentityPrincipal: true
}

// Azure Functions (C# .NET, Flex Consumption)
module api './app/api.bicep' = {
  name: 'api'
  scope: rg
  params: {
    name: !empty(apiServiceName) ? apiServiceName : functionAppDefaultName
    location: location
    tags: tags
    applicationInsightsName: monitoring.outputs.name
    appServicePlanId: appServicePlan.outputs.resourceId
    runtimeName: 'dotnet-isolated'
    runtimeVersion: '10.0'
    storageAccountName: storage.outputs.name
    enableBlob: storageEndpointConfig.enableBlob
    enableQueue: storageEndpointConfig.enableQueue
    enableTable: storageEndpointConfig.enableTable
    deploymentStorageContainerName: deploymentStorageContainerName
    identityId: apiUserAssignedIdentity.outputs.resourceId
    identityClientId: apiUserAssignedIdentity.outputs.clientId
    appSettings: {
      // Table Storage endpoint — read by Program.cs via DefaultAzureCredential
      StorageTableEndpoint: storage.outputs.primaryTableEndpoint
    }
    virtualNetworkSubnetId: ''
  }
}

// RBAC — grant Managed Identity access to Blob + Table Storage and App Insights
module rbac './app/rbac.bicep' = {
  name: 'rbacAssignments'
  scope: rg
  params: {
    storageAccountName: storage.outputs.name
    appInsightsName: monitoring.outputs.name
    managedIdentityPrincipalId: apiUserAssignedIdentity.outputs.principalId
    userIdentityPrincipalId: principalId
    enableBlob: storageEndpointConfig.enableBlob
    enableQueue: storageEndpointConfig.enableQueue
    enableTable: storageEndpointConfig.enableTable
    allowUserIdentityPrincipal: storageEndpointConfig.allowUserIdentityPrincipal
  }
}

// Log Analytics workspace
module logAnalytics 'br/public:avm/res/operational-insights/workspace:0.11.1' = {
  name: 'loganalytics'
  scope: rg
  params: {
    name: !empty(logAnalyticsName) ? logAnalyticsName : logAnalyticsDefaultName
    location: location
    tags: tags
    dataRetention: 30
  }
}

// Application Insights
module monitoring 'br/public:avm/res/insights/component:0.6.0' = {
  name: 'appinsights'
  scope: rg
  params: {
    name: !empty(applicationInsightsName) ? applicationInsightsName : applicationInsightsDefaultName
    location: location
    tags: tags
    workspaceResourceId: logAnalytics.outputs.resourceId
    disableLocalAuth: true
  }
}

// Azure Static Web App — hosts the HTML/JS frontend (free tier)
module staticWebApp 'br/public:avm/res/web/static-site:0.3.0' = {
  name: 'staticWebApp'
  scope: rg
  params: {
    name: !empty(staticWebAppName) ? staticWebAppName : staticWebAppDefaultName
    location: location
    tags: union(tags, { 'azd-service-name': 'web' })
    sku: 'Free'
  }
}

// Outputs consumed by azd and local tooling
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output SERVICE_API_NAME string = api.outputs.SERVICE_API_NAME
output AZURE_FUNCTION_NAME string = api.outputs.SERVICE_API_NAME
output AZURE_STORAGE_ACCOUNT_NAME string = storage.outputs.name
output AZURE_STATIC_WEB_APP_NAME string = staticWebApp.outputs.name
