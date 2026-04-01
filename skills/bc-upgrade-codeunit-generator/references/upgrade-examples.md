# Upgrade Codeunit Examples

## Example 1: Basic Upgrade Codeunit — Version-Based Control

The foundational pattern using `ModuleInfo.DataVersion` to control which upgrade steps run. Suitable for simple extensions with infrequent version changes.

```al
codeunit 50100 "BCS Upgrade"
{
    Subtype = Upgrade;

    trigger OnCheckPreconditionsPerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        // Block upgrade from incompatible versions
        if AppInfo.DataVersion < Version.Create(1, 0, 0, 0) then
            Error(IncompatibleVersionErr, AppInfo.DataVersion);
    end;

    trigger OnUpgradePerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        // DataVersion = version we're upgrading FROM
        if AppInfo.DataVersion.Major() < 2 then
            UpgradeToV2();

        if AppInfo.DataVersion < Version.Create(2, 1, 0, 0) then
            UpgradeToV2_1();
    end;

    trigger OnValidateUpgradePerCompany()
    begin
        ValidateSetupRecord();
    end;

    local procedure UpgradeToV2()
    var
        Setup: Record "BCS Module Setup";
    begin
        if Setup.Get() then begin
            Setup."New V2 Feature Enabled" := false;
            Setup.Modify(true);
        end;
    end;

    local procedure UpgradeToV2_1()
    var
        MyRecord: Record "BCS Custom Record";
    begin
        MyRecord.SetRange(Status, MyRecord.Status::" ");
        MyRecord.ModifyAll(Status, MyRecord.Status::Active, false);
    end;

    local procedure ValidateSetupRecord()
    var
        Setup: Record "BCS Module Setup";
    begin
        if not Setup.Get() then
            Error(SetupMissingAfterUpgradeErr);
    end;

    var
        IncompatibleVersionErr: Label 'Cannot upgrade from version %1. Minimum required version is 1.0.0.0.', Comment = '%1 = DataVersion';
        SetupMissingAfterUpgradeErr: Label 'Setup record is missing after upgrade. The upgrade may have failed.';
}
```

**Key points:**
- `OnCheckPreconditionsPerCompany` blocks incompatible upgrades early
- `DataVersion` in upgrade context = the version you're upgrading **from**
- Version comparisons using `<` allow cumulative upgrades (e.g., v1.0 → v2.1 runs both steps)
- `OnValidateUpgradePerCompany` verifies data integrity after upgrade
- Error labels use `Comment` for translator context

---

## Example 2: Upgrade with Upgrade Tags — Recommended Pattern

The recommended pattern for larger applications. Uses upgrade tags from the System Application to ensure upgrade code runs exactly once and handles new company creation correctly.

```al
codeunit 50100 "BCS Upgrade Shoe Size"
{
    Subtype = Upgrade;

    trigger OnUpgradePerCompany()
    begin
        UpgradeShoeSize();
        UpgradeCustomerCategory();
    end;

    local procedure UpgradeShoeSize()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
        Customer: Record Customer;
    begin
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetShoeSizeUpgradeTag()) then
            exit;

        Customer.SetLoadFields("ABC - Customer Shoesize", Shoesize);
        if Customer.FindSet() then
            repeat
                if Customer."ABC - Customer Shoesize" = 0 then
                    if Customer.Shoesize <> 0 then begin
                        Customer."ABC - Customer Shoesize" := Customer.Shoesize;
                        Customer.Modify(false);
                    end;
            until Customer.Next() = 0;

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetShoeSizeUpgradeTag());
    end;

    local procedure UpgradeCustomerCategory()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
        Customer: Record Customer;
    begin
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetCustomerCategoryUpgradeTag()) then
            exit;

        Customer.SetLoadFields("BCS Category Code");
        Customer.SetRange("BCS Category Code", '');
        if Customer.FindSet() then
            repeat
                Customer."BCS Category Code" := 'GEN';
                Customer.Modify(false);
            until Customer.Next() = 0;

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetCustomerCategoryUpgradeTag());
    end;
}
```

### Companion: Upgrade Tag Definitions Codeunit

```al
codeunit 50101 "BCS Upgrade Tag Definitions"
{
    Access = Internal;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Upgrade Tag", OnGetPerCompanyUpgradeTags, '', false, false)]
    local procedure OnGetPerCompanyTags(var PerCompanyUpgradeTags: List of [Code[250]])
    begin
        PerCompanyUpgradeTags.Add(GetShoeSizeUpgradeTag());
        PerCompanyUpgradeTags.Add(GetCustomerCategoryUpgradeTag());
    end;

    procedure GetShoeSizeUpgradeTag(): Code[250]
    begin
        exit('BCS-50100-ShoeSizeUpgrade-20260101');
    end;

    procedure GetCustomerCategoryUpgradeTag(): Code[250]
    begin
        exit('BCS-50100-CustomerCategoryUpgrade-20260315');
    end;
}
```

### Companion: Install Codeunit — Register Tags on Fresh Install

```al
codeunit 50102 "BCS Install"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    var
        UpgradeTag: Codeunit "Upgrade Tag";
    begin
        if not UpgradeTag.HasUpgradeTag(GetShoeSizeTag()) then
            UpgradeTag.SetUpgradeTag(GetShoeSizeTag());

        if not UpgradeTag.HasUpgradeTag(GetCustomerCategoryTag()) then
            UpgradeTag.SetUpgradeTag(GetCustomerCategoryTag());
    end;

    local procedure GetShoeSizeTag(): Code[250]
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
    begin
        exit(UpgradeTagDef.GetShoeSizeUpgradeTag());
    end;

    local procedure GetCustomerCategoryTag(): Code[250]
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
    begin
        exit(UpgradeTagDef.GetCustomerCategoryUpgradeTag());
    end;
}
```

**Key points:**
- **Three codeunits** work together: Upgrade, Upgrade Tag Definitions, and Install
- Upgrade tag convention: `[Prefix]-[ObjectID]-[Description]-[YYYYMMDD]`
- `OnGetPerCompanyUpgradeTags` registers tags for new companies so upgrade code won't run on them
- Install codeunit sets tags on fresh install so upgrade code doesn't run on first upgrade
- `SetLoadFields` used for performance when iterating large tables
- `Modify(false)` avoids firing triggers during bulk data migration
- Each upgrade step is independently guarded by its own tag

---

## Example 3: Database-Level Upgrade with Precondition Checks

Upgrade codeunit focused on database-wide operations with thorough precondition validation and data archival.

```al
codeunit 50100 "BCS Database Upgrade"
{
    Subtype = Upgrade;

    trigger OnCheckPreconditionsPerDatabase()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        // Ensure minimum source version
        if AppInfo.DataVersion < Version.Create(1, 0, 0, 0) then
            Error(MinVersionRequiredErr, '1.0.0.0', Format(AppInfo.DataVersion));

        // Verify required dependencies are available
        VerifyDependencies();
    end;

    trigger OnUpgradePerDatabase()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
    begin
        if not UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetDatabaseSchemaUpgradeTag()) then begin
            MigrateDatabaseConfiguration();
            UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetDatabaseSchemaUpgradeTag());
        end;
    end;

    trigger OnValidateUpgradePerDatabase()
    begin
        ValidateDatabaseConfiguration();
    end;

    local procedure VerifyDependencies()
    var
        ModInfo: ModuleInfo;
    begin
        // Check that a required dependency extension is installed
        if not NavApp.GetModuleInfo('12345678-abcd-1234-abcd-123456789012', ModInfo) then
            Error(DependencyMissingErr, 'Required Extension Name');
    end;

    local procedure MigrateDatabaseConfiguration()
    begin
        // Database-wide configuration migration
        // Example: move data from old config table to new one
    end;

    local procedure ValidateDatabaseConfiguration()
    begin
        // Validate the migration succeeded
    end;

    var
        MinVersionRequiredErr: Label 'Upgrade requires minimum version %1. Current data version is %2.', Comment = '%1 = Required version, %2 = Current version';
        DependencyMissingErr: Label 'Required extension ''%1'' is not installed. Install it before upgrading.', Comment = '%1 = Extension name';
}
```

### Companion: Upgrade Tag Definitions (Database Tags)

```al
codeunit 50101 "BCS Upgrade Tag Definitions"
{
    Access = Internal;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Upgrade Tag", OnGetPerDatabaseUpgradeTags, '', false, false)]
    local procedure OnGetPerDatabaseTags(var PerDatabaseUpgradeTags: List of [Code[250]])
    begin
        PerDatabaseUpgradeTags.Add(GetDatabaseSchemaUpgradeTag());
    end;

    procedure GetDatabaseSchemaUpgradeTag(): Code[250]
    begin
        exit('BCS-50100-DatabaseSchemaUpgrade-20260315');
    end;
}
```

**Key points:**
- `OnCheckPreconditionsPerDatabase` runs once before any upgrade code
- Dependency verification using `NavApp.GetModuleInfo` with the dependency's App ID
- `OnGetPerDatabaseUpgradeTags` (not PerCompany) for database-scope tags
- Validation trigger confirms the migration completed correctly
- Errors in preconditions abort the entire upgrade process

---

## Example 4: Multi-Step Upgrade with Telemetry

Comprehensive upgrade codeunit combining multiple migration steps, telemetry logging for Application Insights, and error resilience.

```al
codeunit 50100 "BCS Full Upgrade"
{
    Subtype = Upgrade;

    trigger OnCheckPreconditionsPerCompany()
    begin
        CheckDataIntegrity();
    end;

    trigger OnUpgradePerCompany()
    begin
        MigrateFieldData();
        PopulateNewTable();
        UpdateEnumValues();
    end;

    trigger OnValidateUpgradePerCompany()
    begin
        ValidateFieldMigration();
        ValidateNewTableData();
    end;

    local procedure CheckDataIntegrity()
    var
        Setup: Record "BCS Module Setup";
    begin
        if not Setup.Get() then
            Error(SetupMissingErr);
    end;

    local procedure MigrateFieldData()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
        SalesHeader: Record "Sales Header";
        RecordsUpdated: Integer;
    begin
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetFieldMigrationTag()) then
            exit;

        LogUpgradeStart('MigrateFieldData');

        SalesHeader.SetLoadFields("BCS Old Field", "BCS New Field");
        SalesHeader.SetFilter("BCS Old Field", '<>%1', '');
        SalesHeader.SetRange("BCS New Field", '');
        if SalesHeader.FindSet() then
            repeat
                SalesHeader."BCS New Field" := SalesHeader."BCS Old Field";
                SalesHeader.Modify(false);
                RecordsUpdated += 1;
            until SalesHeader.Next() = 0;

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetFieldMigrationTag());
        LogUpgradeEnd('MigrateFieldData', RecordsUpdated);
    end;

    local procedure PopulateNewTable()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
        Customer: Record Customer;
        CustMetric: Record "BCS Customer Metric";
        RecordsCreated: Integer;
    begin
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetNewTablePopulationTag()) then
            exit;

        LogUpgradeStart('PopulateNewTable');

        Customer.SetLoadFields("No.", "BCS Metric Value");
        Customer.SetFilter("BCS Metric Value", '<>%1', 0);
        if Customer.FindSet() then
            repeat
                if not CustMetric.Get(Customer."No.") then begin
                    CustMetric.Init();
                    CustMetric."Customer No." := Customer."No.";
                    CustMetric."Metric Value" := Customer."BCS Metric Value";
                    CustMetric."Created On" := CurrentDateTime();
                    CustMetric.Insert(false);
                    RecordsCreated += 1;
                end;
            until Customer.Next() = 0;

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetNewTablePopulationTag());
        LogUpgradeEnd('PopulateNewTable', RecordsCreated);
    end;

    local procedure UpdateEnumValues()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
        MyRecord: Record "BCS Custom Record";
        RecordsUpdated: Integer;
    begin
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetEnumMigrationTag()) then
            exit;

        LogUpgradeStart('UpdateEnumValues');

        // Migrate from old integer-based status to new enum
        MyRecord.SetLoadFields(Status, "Legacy Status Code");
        MyRecord.SetRange(Status, MyRecord.Status::" ");
        MyRecord.SetFilter("Legacy Status Code", '<>%1', 0);
        if MyRecord.FindSet() then
            repeat
                case MyRecord."Legacy Status Code" of
                    1:
                        MyRecord.Status := MyRecord.Status::Draft;
                    2:
                        MyRecord.Status := MyRecord.Status::Active;
                    3:
                        MyRecord.Status := MyRecord.Status::Closed;
                end;
                MyRecord.Modify(false);
                RecordsUpdated += 1;
            until MyRecord.Next() = 0;

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetEnumMigrationTag());
        LogUpgradeEnd('UpdateEnumValues', RecordsUpdated);
    end;

    local procedure ValidateFieldMigration()
    var
        SalesHeader: Record "Sales Header";
    begin
        SalesHeader.SetFilter("BCS Old Field", '<>%1', '');
        SalesHeader.SetRange("BCS New Field", '');
        if not SalesHeader.IsEmpty() then
            Error(FieldMigrationFailedErr);
    end;

    local procedure ValidateNewTableData()
    var
        Customer: Record Customer;
        CustMetric: Record "BCS Customer Metric";
    begin
        Customer.SetFilter("BCS Metric Value", '<>%1', 0);
        if Customer.FindSet() then
            repeat
                if not CustMetric.Get(Customer."No.") then
                    Error(NewTablePopulationFailedErr, Customer."No.");
            until Customer.Next() = 0;
    end;

    local procedure LogUpgradeStart(StepName: Text)
    var
        Dimensions: Dictionary of [Text, Text];
    begin
        Dimensions.Add('UpgradeStep', StepName);
        Dimensions.Add('CompanyName', CompanyName());
        Dimensions.Add('StartTime', Format(CurrentDateTime()));

        Session.LogMessage(
            'BCS-UPG-0001',
            StrSubstNo('Upgrade step %1 started', StepName),
            Verbosity::Normal,
            DataClassification::SystemMetadata,
            TelemetryScope::ExtensionPublisher,
            Dimensions
        );
    end;

    local procedure LogUpgradeEnd(StepName: Text; RecordsAffected: Integer)
    var
        Dimensions: Dictionary of [Text, Text];
    begin
        Dimensions.Add('UpgradeStep', StepName);
        Dimensions.Add('CompanyName', CompanyName());
        Dimensions.Add('RecordsAffected', Format(RecordsAffected));
        Dimensions.Add('EndTime', Format(CurrentDateTime()));

        Session.LogMessage(
            'BCS-UPG-0002',
            StrSubstNo('Upgrade step %1 completed — %2 records affected', StepName, RecordsAffected),
            Verbosity::Normal,
            DataClassification::SystemMetadata,
            TelemetryScope::ExtensionPublisher,
            Dimensions
        );
    end;

    var
        SetupMissingErr: Label 'BCS Module Setup record is missing. Cannot proceed with upgrade.';
        FieldMigrationFailedErr: Label 'Field migration incomplete: some Sales Header records still have BCS Old Field without BCS New Field.';
        NewTablePopulationFailedErr: Label 'Customer Metric record missing for Customer %1 after upgrade.', Comment = '%1 = Customer No.';
}
```

### Companion: Upgrade Tag Definitions

```al
codeunit 50101 "BCS Upgrade Tag Definitions"
{
    Access = Internal;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Upgrade Tag", OnGetPerCompanyUpgradeTags, '', false, false)]
    local procedure OnGetPerCompanyTags(var PerCompanyUpgradeTags: List of [Code[250]])
    begin
        PerCompanyUpgradeTags.Add(GetFieldMigrationTag());
        PerCompanyUpgradeTags.Add(GetNewTablePopulationTag());
        PerCompanyUpgradeTags.Add(GetEnumMigrationTag());
    end;

    procedure GetFieldMigrationTag(): Code[250]
    begin
        exit('BCS-50100-FieldMigration-20260301');
    end;

    procedure GetNewTablePopulationTag(): Code[250]
    begin
        exit('BCS-50100-NewTablePopulation-20260301');
    end;

    procedure GetEnumMigrationTag(): Code[250]
    begin
        exit('BCS-50100-EnumMigration-20260301');
    end;
}
```

**Key points:**
- Each upgrade step is independently guarded by an upgrade tag
- Telemetry logs start/end of each step with record counts for Application Insights visibility
- `SetLoadFields` before `FindSet` for performance on large tables
- `Modify(false)` to skip trigger execution during bulk migration
- Validation trigger confirms each migration step completed successfully
- Errors in validation abort the upgrade and signal the operation failed

---

## Example 5: Protecting Sensitive Code During Upgrade — ExecutionContext

Event subscribers may fire during an upgrade. Use `Session.GetExecutionContext()` to prevent sensitive operations (external API calls, printing, email sending) from running during upgrade context.

```al
codeunit 50100 "BCS Sensitive Code Guard"
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", OnAfterPostSalesDoc, '', false, false)]
    local procedure OnAfterPostSalesDoc(var SalesHeader: Record "Sales Header")
    begin
        // Guard: do not call external services during upgrade
        if Session.GetExecutionContext() <> ExecutionContext::Normal then
            exit;

        CallExternalNotificationService(SalesHeader);
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Purch.-Post", OnAfterPurchInvHeaderInsert, '', false, false)]
    local procedure OnAfterPurchInvHeaderInsert(var PurchHeader: Record "Purchase Header"; var PurchInvHeader: Record "Purch. Inv. Header")
    begin
        // Guard: do not print checks during upgrade or install
        if Session.GetExecutionContext() in
            [ExecutionContext::Upgrade, ExecutionContext::Install]
        then
            exit;

        // Additional guard: check if the current module triggered the context
        if Session.GetCurrentModuleExecutionContext() <> ExecutionContext::Normal then begin
            // Our extension is being installed/upgraded — enqueue for later
            EnqueueDeferredAction(PurchInvHeader);
            exit;
        end;

        // Normal execution path
        PrintCheck(PurchInvHeader);
    end;

    local procedure CallExternalNotificationService(var SalesHeader: Record "Sales Header")
    begin
        // External API call — must not run during upgrade
    end;

    local procedure PrintCheck(var PurchInvHeader: Record "Purch. Inv. Header")
    begin
        // Physical action — cannot be rolled back
    end;

    local procedure EnqueueDeferredAction(var PurchInvHeader: Record "Purch. Inv. Header")
    begin
        // Use Job Queue or similar mechanism for deferred execution
    end;
}
```

**Key points:**
- `Session.GetExecutionContext()` returns the current session context: `Normal`, `Install`, `Uninstall`, or `Upgrade`
- `Session.GetCurrentModuleExecutionContext()` checks if **your extension** triggered the context
- Guard external API calls, printing, email, and other irreversible operations
- Use `in [ExecutionContext::Upgrade, ExecutionContext::Install]` to guard against both contexts
- Enqueue deferred actions via Job Queue when operations must eventually run but not during upgrade

---

## Example 6: Fixing a Broken Upgrade with Upgrade Tags

When a previous upgrade failed or introduced data issues, upgrade tags let you deploy a fix without re-running old upgrade code.

```al
codeunit 50100 "BCS Upgrade Fix"
{
    Subtype = Upgrade;

    trigger OnUpgradePerCompany()
    begin
        FixBrokenShoeSize();
    end;

    local procedure FixBrokenShoeSize()
    var
        UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
        UpgradeTag: Codeunit "Upgrade Tag";
        Customer: Record Customer;
        RecordsFixed: Integer;
    begin
        // The fix tag is new — old broken upgrade tag already exists
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetShoeSizeFixTag()) then
            exit;

        // Fix the data corruption from the broken upgrade
        Customer.SetLoadFields("ABC - Customer Shoesize");
        Customer.SetRange("ABC - Customer Shoesize", -1); // Bad data from broken upgrade
        if Customer.FindSet() then
            repeat
                Customer."ABC - Customer Shoesize" := 0;
                Customer.Modify(false);
                RecordsFixed += 1;
            until Customer.Next() = 0;

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetShoeSizeFixTag());
    end;
}
```

**Key points:**
- Create a **new tag** for the fix — don't reuse or remove the old broken tag
- Only targets records affected by the broken upgrade
- Simple, focused fix that can be deployed as a patch version
- The old upgrade tag (`GetShoeSizeUpgradeTag`) remains set — its code won't re-run

---

## Example 7: Upgrade with Data Archive Restoration

Use `NavApp.RestoreArchiveData` to restore data that was archived during a previous extension uninstall. Applicable when upgrading after an interim uninstall.

```al
codeunit 50100 "BCS Archive Upgrade"
{
    Subtype = Upgrade;

    trigger OnCheckPreconditionsPerDatabase()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        if AppInfo.DataVersion = Version.Create(1, 0, 0, 1) then
            Error(IncompatibleVersionErr);
    end;

    trigger OnUpgradePerDatabase()
    begin
        NavApp.RestoreArchiveData(Database::"BCS Custom Table");
        NavApp.RestoreArchiveData(Database::"BCS Setup Table");
    end;

    trigger OnValidateUpgradePerDatabase()
    var
        CustomTable: Record "BCS Custom Table";
    begin
        if CustomTable.IsEmpty() then
            Error(ArchiveRestoreFailedErr);
    end;

    var
        IncompatibleVersionErr: Label 'Cannot upgrade from version 1.0.0.1. This version has known data issues.';
        ArchiveRestoreFailedErr: Label 'Archive data restoration failed. BCS Custom Table is empty after upgrade.';
}
```

**Key points:**
- `NavApp.RestoreArchiveData` restores data archived during uninstall of the previous version
- Pass the `Database::` reference for each table to restore
- Validate restoration in `OnValidateUpgradePerDatabase`
- Block specific incompatible versions in precondition checks

---

## Common Anti-Patterns

### Anti-Pattern: Missing Upgrade Tag Guard

```al
// WRONG — Runs every upgrade, even if data was already migrated
local procedure MigrateData()
var
    Customer: Record Customer;
begin
    Customer.SetRange("BCS New Field", '');
    if Customer.FindSet() then
        repeat
            Customer."BCS New Field" := Customer."BCS Old Field";
            Customer.Modify(false);
        until Customer.Next() = 0;
end;

// CORRECT — Guarded by upgrade tag
local procedure MigrateData()
var
    UpgradeTagDef: Codeunit "BCS Upgrade Tag Definitions";
    UpgradeTag: Codeunit "Upgrade Tag";
    Customer: Record Customer;
begin
    if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetFieldMigrationTag()) then
        exit;

    Customer.SetRange("BCS New Field", '');
    if Customer.FindSet() then
        repeat
            Customer."BCS New Field" := Customer."BCS Old Field";
            Customer.Modify(false);
        until Customer.Next() = 0;

    UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetFieldMigrationTag());
end;
```

### Anti-Pattern: Not Registering Tags for New Companies

```al
// WRONG — Only upgrade codeunit, no tag registration for new companies
codeunit 50100 "BCS Upgrade"
{
    Subtype = Upgrade;

    trigger OnUpgradePerCompany()
    begin
        // This will run unnecessarily on first upgrade
        // for companies created after this version shipped
    end;
}

// CORRECT — Register tags for new companies
codeunit 50101 "BCS Upgrade Tag Definitions"
{
    // This ensures new companies get the tag automatically
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Upgrade Tag", OnGetPerCompanyUpgradeTags, '', false, false)]
    local procedure OnGetPerCompanyTags(var PerCompanyUpgradeTags: List of [Code[250]])
    begin
        PerCompanyUpgradeTags.Add(GetMyUpgradeTag());
    end;

    procedure GetMyUpgradeTag(): Code[250]
    begin
        exit('BCS-50100-MyUpgrade-20260301');
    end;
}
```

### Anti-Pattern: Not Setting Tags on Fresh Install

```al
// WRONG — After fresh install, the first upgrade will run migration
// code on data that doesn't need migration
codeunit 50102 "BCS Install"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    begin
        InitializeSetup();
        // Forgot to set upgrade tags!
    end;
}

// CORRECT — Set all upgrade tags on fresh install
codeunit 50102 "BCS Install"
{
    Subtype = Install;

    trigger OnInstallAppPerCompany()
    var
        UpgradeTag: Codeunit "Upgrade Tag";
    begin
        InitializeSetup();
        // Set all known upgrade tags so upgrade code won't run
        // on data that was freshly created
        UpgradeTag.SetAllUpgradeTags();
    end;
}
```

### Anti-Pattern: Modify(true) During Bulk Migration

```al
// WRONG — Firing triggers on every record slows the upgrade
Customer.Modify(true);

// CORRECT — Skip triggers for bulk data migration
Customer.Modify(false);
```

### Anti-Pattern: Depending on Codeunit Execution Order

```al
// WRONG — Assumes codeunit 50100 runs before 50101
codeunit 50101 "BCS Upgrade Step 2"
{
    Subtype = Upgrade;

    trigger OnUpgradePerCompany()
    var
        MigratedData: Record "BCS Migrated Data";
    begin
        MigratedData.FindFirst();  // May fail if codeunit 50100 hasn't run
    end;
}

// CORRECT — Each upgrade codeunit must be self-sufficient
// or combine steps into a single codeunit where order is controlled
```

---

## Upgrade Trigger Execution Order

| Order | Trigger | Scope | Purpose |
|-------|---------|-------|---------|
| 1 | `OnCheckPreconditionsPerDatabase()` | Once | Validate database-level prerequisites |
| 2 | `OnCheckPreconditionsPerCompany()` | Per company | Validate company-level prerequisites |
| 3 | `OnUpgradePerDatabase()` | Once | Execute database-wide data migration |
| 4 | `OnUpgradePerCompany()` | Per company | Execute company-specific data migration |
| 5 | `OnValidateUpgradePerDatabase()` | Once | Verify database-level upgrade success |
| 6 | `OnValidateUpgradePerCompany()` | Per company | Verify company-level upgrade success |

**Notes:**
- If **any** precondition trigger raises an error, the **entire upgrade is aborted**
- If **any** validation trigger raises an error, the **upgrade is marked as failed**
- Multiple upgrade codeunits may exist, but their **relative execution order is not guaranteed**
- All triggers within a single codeunit follow the order above

---

## Install vs Upgrade — When to Use Which

| Scenario | Codeunit Type | Trigger |
|----------|--------------|---------|
| Extension installed for the first time | Install (`Subtype = Install`) | `OnInstallAppPerCompany` / `OnInstallAppPerDatabase` |
| Same version reinstalled after uninstall | Install (`Subtype = Install`) | `OnInstallAppPerCompany` / `OnInstallAppPerDatabase` |
| New version published and upgraded | Upgrade (`Subtype = Upgrade`) | `OnUpgradePerCompany` / `OnUpgradePerDatabase` |
| Migrating data between versions | Upgrade (`Subtype = Upgrade`) | `OnUpgradePerCompany` |
| Checking preconditions before upgrade | Upgrade (`Subtype = Upgrade`) | `OnCheckPreconditionsPerCompany` / `OnCheckPreconditionsPerDatabase` |
| Validating upgrade success | Upgrade (`Subtype = Upgrade`) | `OnValidateUpgradePerCompany` / `OnValidateUpgradePerDatabase` |
| Blocking incompatible source versions | Upgrade (`Subtype = Upgrade`) | `OnCheckPreconditionsPerCompany` / `OnCheckPreconditionsPerDatabase` |
| Restoring archived data | Upgrade (`Subtype = Upgrade`) | `OnUpgradePerDatabase` |
| Protecting external calls during upgrade | Event Subscriber | `Session.GetExecutionContext()` guard |

---

## Version Data Properties Reference

| Context | `AppVersion` | `DataVersion` |
|---------|-------------|---------------|
| Normal operation | Current installed version | Same as AppVersion |
| Install (fresh) | Version being installed | `0.0.0.0` |
| Install (reinstall) | Version being reinstalled | Same as AppVersion |
| Upgrade | Version upgrading **to** (new) | Version upgrading **from** (old) |

---

## PowerShell Commands for Upgrade Deployment

```powershell
# 1. Publish the new version
Publish-NAVApp -ServerInstance BC -Path .\MyExtension_2.0.0.0.app -SkipVerification

# 2. Synchronize schema changes
Sync-NAVApp -ServerInstance BC -Name "My Extension" -Version 2.0.0.0

# 3. Run data upgrade (triggers upgrade codeunits)
Start-NAVAppDataUpgrade -ServerInstance BC -Name "My Extension" -Version 2.0.0.0
```
