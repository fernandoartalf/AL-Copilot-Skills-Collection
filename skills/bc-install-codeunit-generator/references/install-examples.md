# Install Codeunit Examples

## Example 1: Basic Install Codeunit — Fresh Install and Reinstall Detection

The foundational pattern from Microsoft's documentation. Detects whether this is a first-time install or a reinstall using `DataVersion`.

```al
codeunit 50100 "BCS Install"
{
    Subtype = Install;

    trigger OnInstallAppPerDatabase()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
            HandleFreshInstallDatabase()
        else
            HandleReinstallDatabase();
    end;

    trigger OnInstallAppPerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
            HandleFreshInstallCompany()
        else
            HandleReinstallCompany();
    end;

    local procedure HandleFreshInstallDatabase()
    begin
        // Database-wide first-time operations
        // Example: register telemetry, set global flags
    end;

    local procedure HandleReinstallDatabase()
    begin
        // Database-wide reinstall operations
        // Example: re-register webhooks, validate global config
    end;

    local procedure HandleFreshInstallCompany()
    begin
        // Per-company first-time operations
        // Example: create setup record, seed defaults
    end;

    local procedure HandleReinstallCompany()
    begin
        // Per-company reinstall operations
        // Example: patch missing data, validate setup
    end;
}
```

**Key points:**
- `DataVersion = 0.0.0.0` means the extension has never been installed before
- Any other DataVersion means the same version is being reinstalled
- Per-database triggers run once; per-company triggers run for every company

---

## Example 2: Setup Table Initialization with Defaults

Creates the singleton setup record with sensible default values on first install.

```al
codeunit 50100 "BCS Stat Acc Install"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
            InitializeExtension()
        else
            ValidateSetup();
    end;

    local procedure InitializeExtension()
    begin
        CreateSetupRecord();
        SeedDefaultCategories();
    end;

    local procedure CreateSetupRecord()
    var
        StatAccSetup: Record "BCS Statistical Account Setup";
    begin
        if not StatAccSetup.Get() then begin
            StatAccSetup.Init();
            StatAccSetup."Enable Posting Notifications" := true;
            StatAccSetup."Default Posting Date" := StatAccSetup."Default Posting Date"::"Work Date";
            StatAccSetup."Allow Manual Posting" := true;
            StatAccSetup.Insert(true);
        end;
    end;

    local procedure SeedDefaultCategories()
    var
        Category: Record "BCS Account Category";
    begin
        InsertCategory('FINANCIAL', 'Financial Metrics');
        InsertCategory('OPERATIONAL', 'Operational KPIs');
        InsertCategory('HR', 'Human Resources Metrics');
    end;

    local procedure InsertCategory(CategoryCode: Code[20]; Description: Text[100])
    var
        Category: Record "BCS Account Category";
    begin
        if not Category.Get(CategoryCode) then begin
            Category.Init();
            Category.Code := CategoryCode;
            Category.Description := Description;
            Category.Insert(true);
        end;
    end;

    local procedure ValidateSetup()
    var
        StatAccSetup: Record "BCS Statistical Account Setup";
    begin
        // On reinstall, ensure setup record exists
        if not StatAccSetup.Get() then
            CreateSetupRecord();
    end;
}
```

**Key points:**
- Setup record creation is idempotent — checks `Get()` before `Insert()`
- Default values are set inline during `Init()` / before `Insert()`
- Reinstall path validates the setup record still exists
- Reference data seeding uses a helper procedure for each record

---

## Example 3: Install with Telemetry Logging

Comprehensive install codeunit that logs telemetry for monitoring install events in Application Insights.

```al
codeunit 50100 "BCS App Install"
{
    Subtype = Install;

    trigger OnInstallAppPerDatabase()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then begin
            LogInstallTelemetry(true);
            HandleFreshInstallDatabase();
        end else begin
            LogInstallTelemetry(false);
            HandleReinstallDatabase();
        end;
    end;

    trigger OnInstallAppPerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
            HandleFreshInstallCompany()
        else
            HandleReinstallCompany();
    end;

    local procedure HandleFreshInstallDatabase()
    begin
        // First-time database operations
    end;

    local procedure HandleReinstallDatabase()
    begin
        // Reinstall database operations
    end;

    local procedure HandleFreshInstallCompany()
    begin
        InitializeSetup();
        LogCompanyInstallTelemetry(true);
    end;

    local procedure HandleReinstallCompany()
    begin
        ValidateSetup();
        LogCompanyInstallTelemetry(false);
    end;

    local procedure InitializeSetup()
    var
        MySetup: Record "BCS My Setup";
    begin
        if not MySetup.Get() then begin
            MySetup.Init();
            MySetup.Insert(true);
        end;
    end;

    local procedure ValidateSetup()
    var
        MySetup: Record "BCS My Setup";
    begin
        if not MySetup.Get() then
            InitializeSetup();
    end;

    local procedure LogInstallTelemetry(FreshInstall: Boolean)
    var
        AppInfo: ModuleInfo;
        Dimensions: Dictionary of [Text, Text];
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);
        Dimensions.Add('ExtensionId', Format(AppInfo.Id));
        Dimensions.Add('ExtensionName', AppInfo.Name);
        Dimensions.Add('ExtensionVersion', Format(AppInfo.AppVersion));
        Dimensions.Add('DataVersion', Format(AppInfo.DataVersion));
        Dimensions.Add('FreshInstall', Format(FreshInstall));
        Dimensions.Add('InstallScope', 'Database');

        Session.LogMessage(
            'BCS-INST-0001',
            StrSubstNo('Extension %1 installed (database scope)', AppInfo.Name),
            Verbosity::Normal,
            DataClassification::SystemMetadata,
            TelemetryScope::ExtensionPublisher,
            Dimensions
        );
    end;

    local procedure LogCompanyInstallTelemetry(FreshInstall: Boolean)
    var
        AppInfo: ModuleInfo;
        Dimensions: Dictionary of [Text, Text];
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);
        Dimensions.Add('ExtensionId', Format(AppInfo.Id));
        Dimensions.Add('ExtensionName', AppInfo.Name);
        Dimensions.Add('CompanyName', CompanyName());
        Dimensions.Add('FreshInstall', Format(FreshInstall));
        Dimensions.Add('InstallScope', 'Company');

        Session.LogMessage(
            'BCS-INST-0002',
            StrSubstNo('Extension %1 installed for company %2', AppInfo.Name, CompanyName()),
            Verbosity::Normal,
            DataClassification::SystemMetadata,
            TelemetryScope::ExtensionPublisher,
            Dimensions
        );
    end;
}
```

**Key points:**
- Telemetry logged in both per-database and per-company triggers
- Custom dimensions include extension metadata, install scope, and fresh/reinstall flag
- Event IDs follow `PREFIX-INST-NNNN` pattern for easy filtering in Application Insights
- `CompanyName()` included in per-company telemetry for multi-company visibility

---

## Example 4: Multi-Table Data Initialization

Install codeunit that seeds multiple related tables with initial data, following dependency order.

```al
codeunit 50100 "BCS Full Install"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
            FullInitialization()
        else
            RepairData();
    end;

    local procedure FullInitialization()
    begin
        // Order matters: parent tables first, then dependents
        InitializeSetup();
        InitializeCategories();
        InitializeTemplates();
        InitializeDefaultDimensions();
    end;

    local procedure InitializeSetup()
    var
        Setup: Record "BCS Module Setup";
    begin
        if not Setup.Get() then begin
            Setup.Init();
            Setup."Enable Auto-Processing" := true;
            Setup."Default Priority" := Setup."Default Priority"::Medium;
            Setup."Notification Email" := '';
            Setup.Insert(true);
        end;
    end;

    local procedure InitializeCategories()
    begin
        InsertCategoryIfMissing('GEN', 'General', 1);
        InsertCategoryIfMissing('FIN', 'Finance', 2);
        InsertCategoryIfMissing('OPS', 'Operations', 3);
        InsertCategoryIfMissing('HR', 'Human Resources', 4);
    end;

    local procedure InsertCategoryIfMissing(Code: Code[10]; Description: Text[50]; SortOrder: Integer)
    var
        Category: Record "BCS Category";
    begin
        if not Category.Get(Code) then begin
            Category.Init();
            Category.Code := Code;
            Category.Description := Description;
            Category."Sort Order" := SortOrder;
            Category.Insert(true);
        end;
    end;

    local procedure InitializeTemplates()
    var
        Template: Record "BCS Template";
    begin
        if not Template.Get('DEFAULT') then begin
            Template.Init();
            Template.Code := 'DEFAULT';
            Template.Description := 'Default Template';
            Template."Is Default" := true;
            Template."Category Code" := 'GEN';
            Template.Insert(true);
        end;
    end;

    local procedure InitializeDefaultDimensions()
    var
        DefaultDim: Record "Default Dimension";
    begin
        // Set up default dimensions for the module's master tables if needed
    end;

    local procedure RepairData()
    begin
        // On reinstall: validate all required data exists
        InitializeSetup();
        InitializeCategories();
        InitializeTemplates();
    end;
}
```

**Key points:**
- Tables initialized in dependency order (setup → categories → templates)
- Each initialization procedure is independently idempotent
- `RepairData` on reinstall calls the same initialization (safe due to idempotency)
- Helper procedures (`InsertCategoryIfMissing`) reduce code duplication

---

## Example 5: Database-Only Install with Permission Assignment

Install codeunit focused on database-level operations only.

```al
codeunit 50100 "BCS Database Install"
{
    Subtype = Install;

    trigger OnInstallAppPerDatabase()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
            HandleFreshInstall()
        else
            HandleReinstall();
    end;

    local procedure HandleFreshInstall()
    begin
        RegisterAppFeatureKeys();
    end;

    local procedure HandleReinstall()
    begin
        // Verify feature keys still exist
        RegisterAppFeatureKeys();
    end;

    local procedure RegisterAppFeatureKeys()
    var
        FeatureKey: Record "Feature Key";
    begin
        if not FeatureKey.Get('BCSStatAccAdvanced') then begin
            FeatureKey.Init();
            FeatureKey.ID := 'BCSStatAccAdvanced';
            FeatureKey.Description := 'BCS Advanced Statistical Accounts';
            FeatureKey.Enabled := FeatureKey.Enabled::None;
            FeatureKey.Insert(true);
        end;
    end;
}
```

**Key points:**
- Only uses `OnInstallAppPerDatabase` — no per-company logic needed
- Feature key registration is database-wide

---

## Common Anti-Patterns

### Anti-Pattern: UI Interaction in Install Code

```al
// WRONG — Install code runs without UI context
trigger OnInstallAppPerCompany()
begin
    Message('Extension installed!');  // Will fail
    if Confirm('Initialize data?') then  // Will fail
        InitializeData();
end;
```

### Anti-Pattern: Non-Idempotent Inserts

```al
// WRONG — Will error on reinstall if record exists
local procedure InitSetup()
var
    MySetup: Record "BCS Setup";
begin
    MySetup.Init();
    MySetup.Insert(true);  // Fails if already exists
end;

// CORRECT — Check before insert
local procedure InitSetup()
var
    MySetup: Record "BCS Setup";
begin
    if not MySetup.Get() then begin
        MySetup.Init();
        MySetup.Insert(true);
    end;
end;
```

### Anti-Pattern: Assuming Install Order Between Codeunits

```al
// WRONG — Don't depend on another install codeunit having run first
codeunit 50101 "BCS Install Step 2"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    var
        MySetup: Record "BCS Setup";
    begin
        MySetup.Get();  // May fail if codeunit 50100 hasn't run yet
        MySetup."Step 2 Done" := true;
        MySetup.Modify(true);
    end;
}

// CORRECT — Each install codeunit must be self-sufficient
codeunit 50101 "BCS Install Step 2"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    var
        MySetup: Record "BCS Setup";
    begin
        if not MySetup.Get() then begin
            MySetup.Init();
            MySetup.Insert(true);
        end;
        MySetup."Step 2 Done" := true;
        MySetup.Modify(true);
    end;
}
```

---

## Install vs Upgrade — When to Use Which

| Scenario | Codeunit Type | Trigger |
|----------|--------------|---------|
| Extension installed for the first time | Install (`Subtype = Install`) | `OnInstallAppPerCompany` / `OnInstallAppPerDatabase` |
| Same version reinstalled after uninstall | Install (`Subtype = Install`) | `OnInstallAppPerCompany` / `OnInstallAppPerDatabase` |
| New version published and upgraded | Upgrade (`Subtype = Upgrade`) | `OnUpgradePerCompany` / `OnUpgradePerDatabase` |
| Need to migrate data between versions | Upgrade (`Subtype = Upgrade`) | `OnUpgradePerCompany` |
| Need to check preconditions before upgrade | Upgrade (`Subtype = Upgrade`) | `OnCheckPreconditionsPerCompany` / `OnCheckPreconditionsPerDatabase` |
