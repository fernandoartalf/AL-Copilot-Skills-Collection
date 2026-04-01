---
name: bc-upgrade-codeunit-generator
description: Generates upgrade codeunits (Subtype = Upgrade) for Business Central extensions that run data migration code when upgrading to a new version. Creates codeunits with OnUpgradePerCompany and OnUpgradePerDatabase triggers, precondition checks via OnCheckPreconditionsPerCompany and OnCheckPreconditionsPerDatabase, post-upgrade validation via OnValidateUpgradePerCompany and OnValidateUpgradePerDatabase, upgrade tag management using the System Application Upgrade Tag module (HasUpgradeTag, SetUpgradeTag, OnGetPerCompanyUpgradeTags, OnGetPerDatabaseUpgradeTags), companion upgrade tag definitions codeunit, install codeunit integration for setting tags on fresh install, version-based upgrade control using ModuleInfo.DataVersion, ExecutionContext guards for protecting sensitive code during upgrades, and NavApp.RestoreArchiveData for archived data restoration. Handles field migration, new table population, enum conversion, data patching, and broken upgrade fixes. Use when asked to create upgrade code, add data migration between versions, implement upgrade logic, create upgrade codeunit, migrate fields to new tables, handle schema changes on upgrade, add upgrade tags, or implement version upgrade handling for a Business Central extension.
---

# Business Central Upgrade Codeunit Generator

Generates production-ready upgrade codeunits for Business Central extensions. Handles data migration between versions, precondition validation, upgrade tag management, and post-upgrade verification.

## Overview

Upgrade codeunits (`Subtype = Upgrade`) run automatically when an extension is upgraded to a **newer version** (higher version number in `app.json`). They do **not** run during fresh installs or reinstalls — use install codeunits for that.

Upgrade code runs when:
- A **new version** of an already-installed extension is published and data-upgraded
- The new version has a **higher version number** than the currently installed version

This skill generates:
- Upgrade codeunit with all six triggers
- Precondition checks to block incompatible upgrades
- Data migration procedures with upgrade tag guards
- Post-upgrade validation
- Companion upgrade tag definitions codeunit
- Install codeunit integration (setting tags on fresh install)
- ExecutionContext guards for sensitive event subscribers

**Complete examples and patterns**: [references/upgrade-examples.md](references/upgrade-examples.md)

## Prerequisites

- AL workspace with established object ID range
- Prefix established (e.g., BCS, ABC, etc.)
- Knowledge of what data needs migration between versions
- System Application dependency (for Upgrade Tag module)
- Existing install codeunit (to register upgrade tags on fresh install)

## Quick Start — Version-Based Control

For simple extensions with few versions:

```al
codeunit [ID] "[Prefix] Upgrade"
{
    Subtype = Upgrade;

    trigger OnCheckPreconditionsPerCompany()
    begin
        // Validate upgrade can proceed
    end;

    trigger OnUpgradePerCompany()
    var
        AppInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(AppInfo);

        // DataVersion = version upgrading FROM
        if AppInfo.DataVersion < Version.Create(2, 0, 0, 0) then
            UpgradeToV2();
    end;

    trigger OnValidateUpgradePerCompany()
    begin
        // Verify upgrade succeeded
    end;

    local procedure UpgradeToV2()
    begin
        // Data migration logic
    end;
}
```

## Quick Start — Upgrade Tags (Recommended)

For larger applications or frequent version changes:

```al
codeunit [ID] "[Prefix] Upgrade"
{
    Subtype = Upgrade;

    trigger OnUpgradePerCompany()
    begin
        MigrateFieldData();
    end;

    local procedure MigrateFieldData()
    var
        UpgradeTagDef: Codeunit "[Prefix] Upgrade Tag Def.";
        UpgradeTag: Codeunit "Upgrade Tag";
    begin
        if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetFieldMigrationTag()) then
            exit;

        // Migration logic here

        UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetFieldMigrationTag());
    end;
}

codeunit [ID+1] "[Prefix] Upgrade Tag Def."
{
    Access = Internal;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Upgrade Tag", OnGetPerCompanyUpgradeTags, '', false, false)]
    local procedure OnGetPerCompanyTags(var PerCompanyUpgradeTags: List of [Code[250]])
    begin
        PerCompanyUpgradeTags.Add(GetFieldMigrationTag());
    end;

    procedure GetFieldMigrationTag(): Code[250]
    begin
        exit('[PREFIX]-[ID]-[Description]-[YYYYMMDD]');
    end;
}
```

## Upgrade Triggers

Triggers execute in the following **guaranteed order**:

| Order | Trigger | Scope | Purpose |
|-------|---------|-------|---------|
| 1 | `OnCheckPreconditionsPerDatabase()` | Once | Validate database-level prerequisites |
| 2 | `OnCheckPreconditionsPerCompany()` | Per company | Validate company-level prerequisites |
| 3 | `OnUpgradePerDatabase()` | Once | Execute database-wide data migration |
| 4 | `OnUpgradePerCompany()` | Per company | Execute company-specific data migration |
| 5 | `OnValidateUpgradePerDatabase()` | Once | Verify database-level upgrade success |
| 6 | `OnValidateUpgradePerCompany()` | Per company | Verify company-level upgrade success |

**Key rules:**
- `PerCompany` triggers run once for **each company** in the database
- `PerDatabase` triggers run **once** regardless of number of companies
- Errors in precondition triggers **abort the entire upgrade**
- Errors in validation triggers **mark the upgrade as failed**
- Multiple upgrade codeunits may exist but execution order between them is **not guaranteed**

## Version Data in Upgrade Context

| Property | Value During Upgrade |
|----------|---------------------|
| `AppVersion` | Version upgrading **to** (new version) |
| `DataVersion` | Version upgrading **from** (old version) |

```al
var
    AppInfo: ModuleInfo;
begin
    NavApp.GetCurrentModuleInfo(AppInfo);
    // AppInfo.DataVersion = old version (upgrading from)
    // AppInfo.AppVersion = new version (upgrading to)
end;
```

## Controlling When Upgrade Code Runs

### Method 1: Version Comparison

Best for simple extensions with manual version control:

```al
trigger OnUpgradePerCompany()
var
    AppInfo: ModuleInfo;
begin
    NavApp.GetCurrentModuleInfo(AppInfo);

    if AppInfo.DataVersion < Version.Create(2, 0, 0, 0) then
        UpgradeToV2();

    if AppInfo.DataVersion < Version.Create(2, 1, 0, 0) then
        UpgradeToV2_1();
end;
```

### Method 2: Upgrade Tags (Recommended)

Best for larger applications, frequent releases, or complex upgrade chains:

```al
local procedure MigrateData()
var
    UpgradeTagDef: Codeunit "[Prefix] Upgrade Tag Def.";
    UpgradeTag: Codeunit "Upgrade Tag";
begin
    if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetMyMigrationTag()) then
        exit;

    // Perform migration

    UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetMyMigrationTag());
end;
```

### When to Use Which

| Criteria | Version Comparison | Upgrade Tags |
|----------|--------------------|--------------|
| Large application with many versions | | **Recommended** |
| Version changes frequently (>1x/year) | | **Recommended** |
| Version is set manually | **Recommended** | |
| Checking for first-time install (`0.0.0.0`) | **Recommended** | |
| Fixing a broken upgrade | | **Recommended** |

## Upgrade Tag Convention

Format: `[Prefix]-[ObjectID]-[Description]-[YYYYMMDD]`

Examples:
- `BCS-50100-ShoeSizeUpgrade-20260101`
- `BCS-50100-FieldMigration-20260315`
- `ABC-50200-EnumConversion-20260401`

## Three-Codeunit Pattern (Upgrade Tags)

When using upgrade tags, implement three companion codeunits:

### 1. Upgrade Codeunit (`Subtype = Upgrade`)
Contains the actual upgrade logic, guarded by `HasUpgradeTag` / `SetUpgradeTag`.

### 2. Upgrade Tag Definitions Codeunit
- Defines tag values as procedures (not hard-coded strings)
- Subscribes to `OnGetPerCompanyUpgradeTags` / `OnGetPerDatabaseUpgradeTags` to register tags for new companies
- `Access = Internal` to prevent external dependencies on tag values

### 3. Install Codeunit (`Subtype = Install`)
- Calls `UpgradeTag.SetAllUpgradeTags()` (or sets individual tags) on `OnInstallAppPerCompany`
- Ensures upgrade code doesn't run on freshly installed extensions

## Common Upgrade Patterns

### Pattern 1: Field Migration (Old Field → New Field)

```al
local procedure MigrateFieldData()
var
    UpgradeTagDef: Codeunit "[Prefix] Upgrade Tag Def.";
    UpgradeTag: Codeunit "Upgrade Tag";
    Customer: Record Customer;
begin
    if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetFieldMigrationTag()) then
        exit;

    Customer.SetLoadFields("[Prefix] Old Field", "[Prefix] New Field");
    Customer.SetFilter("[Prefix] Old Field", '<>%1', '');
    Customer.SetRange("[Prefix] New Field", '');
    if Customer.FindSet() then
        repeat
            Customer."[Prefix] New Field" := Customer."[Prefix] Old Field";
            Customer.Modify(false);
        until Customer.Next() = 0;

    UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetFieldMigrationTag());
end;
```

### Pattern 2: Populate New Table from Existing Data

```al
local procedure PopulateNewTable()
var
    UpgradeTagDef: Codeunit "[Prefix] Upgrade Tag Def.";
    UpgradeTag: Codeunit "Upgrade Tag";
    Source: Record "Source Table";
    Target: Record "[Prefix] New Table";
begin
    if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetNewTableTag()) then
        exit;

    Source.SetLoadFields("No.", "Field A", "Field B");
    if Source.FindSet() then
        repeat
            if not Target.Get(Source."No.") then begin
                Target.Init();
                Target."Entry No." := Source."No.";
                Target."Field A" := Source."Field A";
                Target."Field B" := Source."Field B";
                Target.Insert(false);
            end;
        until Source.Next() = 0;

    UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetNewTableTag());
end;
```

### Pattern 3: Enum Value Migration

```al
local procedure MigrateEnumValues()
var
    UpgradeTagDef: Codeunit "[Prefix] Upgrade Tag Def.";
    UpgradeTag: Codeunit "Upgrade Tag";
    MyRecord: Record "[Prefix] My Record";
begin
    if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetEnumMigrationTag()) then
        exit;

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
        until MyRecord.Next() = 0;

    UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetEnumMigrationTag());
end;
```

### Pattern 4: Default Value Seeding on Upgrade

```al
local procedure SetNewFieldDefaults()
var
    UpgradeTagDef: Codeunit "[Prefix] Upgrade Tag Def.";
    UpgradeTag: Codeunit "Upgrade Tag";
    Setup: Record "[Prefix] Module Setup";
begin
    if UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetDefaultValuesTag()) then
        exit;

    if Setup.Get() then begin
        Setup."New Feature Enabled" := false;
        Setup."Max Items" := 100;
        Setup.Modify(false);
    end;

    UpgradeTag.SetUpgradeTag(UpgradeTagDef.GetDefaultValuesTag());
end;
```

### Pattern 5: Data Archive Restoration

```al
trigger OnUpgradePerDatabase()
begin
    NavApp.RestoreArchiveData(Database::"[Prefix] Custom Table");
end;
```

### Pattern 6: Precondition — Block Incompatible Versions

```al
trigger OnCheckPreconditionsPerCompany()
var
    AppInfo: ModuleInfo;
begin
    NavApp.GetCurrentModuleInfo(AppInfo);

    if AppInfo.DataVersion < Version.Create(1, 0, 0, 0) then
        Error(MinVersionRequiredErr, '1.0.0.0', Format(AppInfo.DataVersion));
end;

var
    MinVersionRequiredErr: Label 'Upgrade requires minimum version %1. Current data version is %2.', Comment = '%1 = Required version, %2 = Current version';
```

### Pattern 7: Post-Upgrade Validation

```al
trigger OnValidateUpgradePerCompany()
var
    Setup: Record "[Prefix] Module Setup";
begin
    if not Setup.Get() then
        Error(SetupMissingErr);

    if Setup."Required Field" = '' then
        Error(RequiredFieldBlankErr);
end;

var
    SetupMissingErr: Label 'Setup record is missing after upgrade.';
    RequiredFieldBlankErr: Label 'Required field is blank after upgrade.';
```

## Protecting Sensitive Code During Upgrade

Event subscribers may fire during upgrades. Guard irreversible operations:

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", OnAfterPostSalesDoc, '', false, false)]
local procedure OnAfterPostSalesDoc(var SalesHeader: Record "Sales Header")
begin
    if Session.GetExecutionContext() <> ExecutionContext::Normal then
        exit;

    // Safe to call external services here
end;
```

### ExecutionContext Values

| Value | When |
|-------|------|
| `ExecutionContext::Normal` | Normal user/API operation |
| `ExecutionContext::Install` | During extension install |
| `ExecutionContext::Uninstall` | During extension uninstall |
| `ExecutionContext::Upgrade` | During extension upgrade |

## Design Guidelines

- **Use upgrade tags** for anything beyond trivial upgrades — they're more robust than version checks
- **Register tags for new companies** via `OnGetPerCompanyUpgradeTags` / `OnGetPerDatabaseUpgradeTags`
- **Set tags on fresh install** via install codeunit so upgrade code doesn't run on new data
- **Use `Modify(false)`** during bulk migration to skip trigger execution
- **Use `SetLoadFields`** before `FindSet` when iterating large tables
- **Keep safety checks** — verify target fields are blank/default before overwriting
- **No UI interaction** — upgrade code runs without user context
- **Idempotent** — upgrade may be retried after failure; guard with tags
- **Independent codeunits** — don't depend on execution order between upgrade codeunits
- **Validate after upgrade** — use validation triggers to confirm migration succeeded
- **Log telemetry** — record step names, record counts, and timing in Application Insights
- **Limit tag nesting** — keep tag checks to max two levels of nesting

## Upgrade Codeunit Design Workflow

1. **Identify data changes** — What changed between versions? New fields, removed fields, table restructuring?
2. **Choose control method** — Version comparison or upgrade tags?
3. **Plan migration steps** — List each data transformation needed, in dependency order
4. **Create upgrade tag definitions** — One tag per migration step, registered for new companies
5. **Implement upgrade codeunit** — Migration logic guarded by tags with `SetLoadFields` and `Modify(false)`
6. **Add precondition checks** — Block incompatible source versions
7. **Add validation checks** — Verify each migration step succeeded
8. **Update install codeunit** — Set upgrade tags on fresh install (`SetAllUpgradeTags` or individual tags)
9. **Add telemetry** — Log start/end of each step with record counts
10. **Test upgrade path** — Verify from each supported source version to the new version

## File Naming Convention

Follow the pattern:
- Upgrade codeunit: `[Prefix]Upgrade.Codeunit.al`
- Upgrade tag definitions: `[Prefix]UpgradeTagDef.Codeunit.al`

Examples:
- `BCSUpgrade.Codeunit.al` / `BCSUpgradeTagDef.Codeunit.al`
- `BCSStatAccUpgrade.Codeunit.al` / `BCSStatAccUpgradeTagDef.Codeunit.al`

Place in: `src/Codeunit/` or feature folder `src/[Feature]/Codeunit/`.

## Checklist

Before completing upgrade codeunit generation:

- [ ] `Subtype = Upgrade` set on upgrade codeunit
- [ ] Upgrade triggers used appropriately (Preconditions → Upgrade → Validate)
- [ ] Upgrade tags created for each migration step (if using tag pattern)
- [ ] Tag definitions codeunit created with `Access = Internal`
- [ ] Tags registered for new companies via `OnGetPerCompanyUpgradeTags` / `OnGetPerDatabaseUpgradeTags`
- [ ] Install codeunit updated to set tags on fresh install
- [ ] `SetLoadFields` used before `FindSet` on large tables
- [ ] `Modify(false)` used for bulk data migration (skip triggers)
- [ ] Safety checks before overwriting fields (verify blank/default)
- [ ] No UI interaction (no Message, Confirm, Page.Run)
- [ ] Precondition checks block incompatible source versions
- [ ] Validation checks verify migration success
- [ ] Telemetry logging for each step (optional)
- [ ] ExecutionContext guards on sensitive event subscribers
- [ ] File follows naming convention

## References

For complete examples:

- [references/upgrade-examples.md](references/upgrade-examples.md) — Full working examples (version-based, upgrade tags, database-level, multi-step with telemetry, ExecutionContext guards, broken upgrade fixes, archive restoration, anti-patterns)

### External Resources

- [Upgrading Extensions](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-upgrading-extensions) — Microsoft Docs
- [Writing Extension Install Code](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-extension-install-code) — Install codeunits (companion)
- [NavApp Data Type](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/methods-auto/navapp/navapp-data-type) — ModuleInfo methods
- [Upgrade Tags (BCApps)](https://github.com/microsoft/BCApps/tree/main/src/System%20Application/App/Upgrade%20Tags) — System Application source code
- [Analyzing Extension Upgrade Telemetry](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/administration/telemetry-extension-update-trace) — Upgrade telemetry signals
