# Azure Deployment Plan

> **Status:** Planning

Generated: 2026-08-13

---

## 1. Project Overview

**Goal:** Migrate the SharedKitchenWebsite from a Node.js/Express/MongoDB app to a C# .NET Azure Functions API backend with Azure Blob Storage for recipe files, targeting Azure free tier resources.

**Path:** Modernize Existing

---

## 2. Requirements

| Attribute | Value |
|-----------|-------|
| Classification | Personal / Development |
| Scale | Small (family/household) |
| Budget | Cost-Optimized (free tier preferred) |
| **Subscription** | _No subscription yet — to be created_ |
| **Location** | _TBD — recommend West Europe (Netherlands) for a Dutch household_ |

---

## 3. Components Detected (Existing Node.js App)

| Component | Type | Technology | Path |
|-----------|------|------------|------|
| homepage route | Frontend page | Express + Pug | routes/homepage.js |
| recipes route | REST API + page | Express + Pug + Mongoose | routes/recipes.js |
| meals route | REST API + page | Express + Pug + Mongoose | routes/meals.js |
| database layer | Data access | Mongoose / MongoDB | database.js |
| views | Server-side templates | Pug | views/ |
| static assets | Frontend | HTML/CSS/JS | public/ |
| Mongoose schemas | Data models | MongoDB | schemas/ |

---

## 4. Recipe Selection

**Selected:** AZD (Bicep)

**Rationale:**
- New Azure project for an existing app modernization
- No existing Azure IaC in the project
- AZD gives simplest deployment (`azd up`) for a solo developer
- Bicep is the default IaC for AZD and integrates well with Azure Functions

---

## 5. Architecture

**Stack:** Serverless (Azure Functions)

### Service Mapping

| Component | Azure Service | SKU / Tier |
|-----------|---------------|------------|
| API backend (recipes, meals, groceries) | Azure Functions (.NET) | Consumption (Y1) — free tier |
| Recipe/data files | Azure Blob Storage | LRS Standard — free tier (5 GB) |
| Frontend (static) | Azure Static Web Apps | Free tier |
| Database / structured data | Azure Table Storage (in same Storage Account) | Free — replaces MongoDB |

### Supporting Services

| Service | Purpose |
|---------|---------|
| Application Insights | Monitoring & APM |
| Log Analytics Workspace | Centralized logging |
| Managed Identity | Secure access to Storage without secrets |

> **Note on database:** MongoDB (Cosmos DB) has no permanent free tier per subscription. To keep costs at zero, Azure Table Storage (part of the Storage Account) is the recommended free alternative for simple document/record storage like recipes and meals. CosmosDB free tier is available (1 per subscription) and can be used if preferred.

---

## 6. Provisioning Limit Checklist

### Phase 1: Resource Inventory

| Resource Type | Number to Deploy | Total After Deployment | Limit/Quota | Notes |
|---------------|------------------|------------------------|-------------|-------|
| Microsoft.Web/sites (Function App) | 1 | _TBD_ | _TBD_ | _TBD_ |
| Microsoft.Storage/storageAccounts | 1 | _TBD_ | _TBD_ | _TBD_ |
| Microsoft.Web/staticSites | 1 | _TBD_ | _TBD_ | _TBD_ |
| Microsoft.Insights/components | 1 | _TBD_ | _TBD_ | _TBD_ |
| Microsoft.OperationalInsights/workspaces | 1 | _TBD_ | _TBD_ | _TBD_ |

### Phase 2: Fetch Quotas and Validate Capacity

_No Azure subscription yet. Quota validation will be done after subscription creation._

**Expected limits (Azure free-tier defaults):**
- Function Apps (Consumption): ~100 per subscription (effectively unlimited for personal use)
- Storage Accounts: 250 per region per subscription
- Static Web Apps (Free): up to 10 per subscription
- Application Insights: no hard limit for personal scale

**Status:** ⏳ Deferred — subscription not yet created. All planned resources are within typical free-tier defaults.

---

## 7. Execution Checklist

### Phase 1: Planning
- [x] Analyze workspace
- [x] Scan codebase
- [x] Select recipe
- [x] Plan architecture
- [ ] Gather requirements — confirm subscription and location with user
- [ ] Prepare resource inventory (Phase 1 complete above)
- [ ] Fetch quotas and validate capacity (Phase 2 — requires subscription + location)
- [ ] **User approved this plan**

### Phase 2: Execution
- [x] Research components (load references, invoke skills)
- [x] Load Azure Functions composition rules
- [x] Generate C# Azure Functions project (recipes, meals, groceries endpoints)
- [x] Generate Azure Blob + Table Storage integration code
- [x] Generate infrastructure files (Bicep via AZD) — based on Azure-Samples/functions-quickstart-dotnet-azd
- [x] Apply Managed Identity for Storage access (no secrets, DefaultAzureCredential)
- [x] Generate azure.yaml
- [x] Apply security best practices (allowSharedKeyAccess: false, TLS 1.2, UAMI)
- [x] Add static HTML/JS frontend (SharedKitchenWeb)
- [ ] **Update plan status to "Ready for Validation"**

### Phase 3: Validation
- [ ] Invoke azure-validate skill
- [ ] All validation checks pass
- [ ] Update plan status to "Validated"

### Phase 4: Deployment
- [ ] Invoke azure-deploy skill
- [ ] Deployment successful
- [ ] Report deployed endpoint URLs
- [ ] Update plan status to "Deployed"

---

## 8. Files to Generate

| File | Purpose | Status |
|------|---------|--------|
| `.azure/deployment-plan.md` | This plan | ✅ |
| `azure.yaml` | AZD configuration | ⏳ |
| `infra/main.bicep` | Main infrastructure | ⏳ |
| `infra/resources.bicep` | Function App + Storage resources | ⏳ |
| `src/SharedKitchenApi/SharedKitchenApi.csproj` | C# Function App project | ⏳ |
| `src/SharedKitchenApi/Functions/RecipesFunctions.cs` | Recipes HTTP endpoints | ⏳ |
| `src/SharedKitchenApi/Functions/MealsFunctions.cs` | Meals HTTP endpoints | ⏳ |
| `src/SharedKitchenApi/Models/Recipe.cs` | Recipe model | ⏳ |
| `src/SharedKitchenApi/Models/Meal.cs` | Meal model | ⏳ |
| `src/SharedKitchenWeb/` | Static frontend (optional) | ⏳ |

---

## 9. Next Steps

> Current: Planning — awaiting user confirmation of subscription and location

1. Confirm Azure subscription and preferred region
2. Complete quota validation (Phase 2)
3. Get user approval on this plan
4. Execute: generate C# Azure Functions code and Bicep infra
