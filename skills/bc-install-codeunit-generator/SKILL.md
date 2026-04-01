---
name: bc-install-codeunit-generator
description: Generates install codeunits (Subtype = Install) for Business Central extensions that run code during first install or reinstall. Creates codeunits with OnInstallAppPerCompany and OnInstallAppPerDatabase triggers, fresh install vs reinstall detection using ModuleInfo.DataVersion, initial data seeding (setup records, default configuration, permission assignments), precondition checks, telemetry logging on install events, and multi-company awareness. Handles NavApp.GetCurrentModuleInfo for version detection and Version.Create(0,0,0,0) pattern for first-time install identification. Use when asked to create install code, add extension installation logic, initialize data on install, seed default records, create install codeunit, implement first-run setup, or add reinstall handling for a Business Central extension.
---

# Business Central Install Codeunit Generator

Generates production-ready install codeunits for Business Central extensions. Handles first install detection, data initialization, reinstall scenarios, and proper separation of per-company vs per-database operations.

## Overview

Install codeunits (`Subtype = Install`) run automatically when an extension is installed or reinstalled. They do **not** run during upgrades — use upgrade codeunits for that. Install code runs when:

- An extension is installed **for the first time**
- An uninstalled extension version is **reinstalled**

This skill generates:
- Install codeunit with proper triggers
- Fresh install vs reinstall detection
- Data seeding procedures (setup records, defaults)
- Per-company and per-database operation separation
- Optional telemetry logging for install events

**Complete examples and patterns**: [references/install-examples.md](references/install-examples.md)

## Prerequisites

- AL workspace with established object ID range
- Prefix established (e.g., BCS, CUSTOM, etc.)
- Knowledge of what data/setup needs initialization
- Setup table(s) identified (if seeding defaults)

## Quick Start

```al
codeunit [ID] "[Prefix] Install"
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
        // Database-wide operations for first install
    end;

    local procedure HandleReinstallDatabase()
    begin
        // Database-wide operations for reinstall
    end;

    local procedure HandleFreshInstallCompany()
    begin
        // Per-company operations for first install
    end;

    local procedure HandleReinstallCompany()
    begin
        // Per-company operations for reinstall
    end;
}
```

## Install Triggers

| Trigger | Scope | Runs | Use For |
|---------|-------|------|---------|
| `OnInstallAppPerDatabase()` | Once per install | One time regardless of company count | Database-level setup: permission assignments, app-wide configuration, telemetry registration |
| `OnInstallAppPerCompany()` | Per company | Once for **each company** in the database | Company-specific data: setup records, default values, number series, demo data |

**Key rule**: Per-database triggers run first, per-company triggers run once for each company.

## Fresh Install vs Reinstall Detection

Use `ModuleInfo.DataVersion` to distinguish between first install and reinstall:

```al
var
    AppInfo: ModuleInfo;
begin
    NavApp.GetCurrentModuleInfo(AppInfo);

    if AppInfo.DataVersion = Version.Create(0, 0, 0, 0) then
        // First-time install — DataVersion is 0.0.0.0
    else
        // Reinstall — same version being installed again
end;
```

### ModuleInfo Properties

| Property | Type | Description |
|----------|------|-------------|
| `DataVersion` | Version | Data version of the extension. `0.0.0.0` on first install. |
| `AppVersion` | Version | App version from `app.json` |
| `Id` | Guid | Extension App ID |
| `Name` | Text | Extension name |
| `Publisher` | Text | Extension publisher |
| `Dependencies` | List of ModuleDependencyInfo | Extension dependencies |

## Common Install Patterns

### Pattern 1: Setup Record Initialization

Create the singleton setup record if it doesn't exist:

```al
local procedure InitializeSetupRecord()
var
    MySetup: Record "[Prefix] [Module] Setup";
begin
    if not MySetup.Get() then begin
        MySetup.Init();
        MySetup.Insert(true);
    end;
end;
```

### Pattern 2: Default Configuration Values

Seed default values into the setup record:

```al
local procedure SetDefaultConfiguration()
var
    MySetup: Record "[Prefix] [Module] Setup";
begin
    if not MySetup.Get() then begin
        MySetup.Init();
        MySetup."Enable Feature" := true;
        MySetup."Default Language" := 'ENU';
        MySetup."Max Retry Count" := 3;
        MySetup.Insert(true);
    end;
end;
```

### Pattern 3: Seed Reference Data

Populate reference/lookup tables with initial data:

```al
local procedure SeedReferenceData()
var
    Category: Record "[Prefix] Category";
begin
    InsertCategoryIfNotExists(Category, 'GENERAL', 'General Category');
    InsertCategoryIfNotExists(Category, 'SPECIAL', 'Special Category');
end;

local procedure InsertCategoryIfNotExists(var Category: Record "[Prefix] Category"; Code: Code[20]; Description: Text[100])
begin
    if not Category.Get(Code) then begin
        Category.Init();
        Category.Code := Code;
        Category.Description := Description;
        Category.Insert(true);
    end;
end;
```

### Pattern 4: Reinstall Data Patch

Check and repair data consistency on reinstall:

```al
local procedure HandleReinstallCompany()
begin
    PatchMissingDefaults();
    ValidateExistingData();
end;

local procedure PatchMissingDefaults()
var
    MySetup: Record "[Prefix] [Module] Setup";
begin
    if MySetup.Get() then begin
        if MySetup."Max Retry Count" = 0 then
            MySetup."Max Retry Count" := 3;
        MySetup.Modify(true);
    end else
        SetDefaultConfiguration();
end;
```

### Pattern 5: Telemetry on Install

Log install events for monitoring:

```al
local procedure LogInstallTelemetry(FreshInstall: Boolean)
var
    AppInfo: ModuleInfo;
    Dimensions: Dictionary of [Text, Text];
begin
    NavApp.GetCurrentModuleInfo(AppInfo);
    Dimensions.Add('ExtensionName', AppInfo.Name);
    Dimensions.Add('ExtensionVersion', Format(AppInfo.AppVersion));
    Dimensions.Add('FreshInstall', Format(FreshInstall));

    Session.LogMessage(
        'BCS-0001',
        'Extension installed',
        Verbosity::Normal,
        DataClassification::SystemMetadata,
        TelemetryScope::ExtensionPublisher,
        Dimensions
    );
end;
```

## Design Guidelines

- **Idempotent**: Install code may run multiple times (reinstall). Always check before inserting records.
- **No user interaction**: Install code runs without UI — no `Confirm`, `Message`, or page calls.
- **Error handling**: Wrap risky operations in error handling. A failing install codeunit blocks the extension install.
- **Multiple codeunits**: You can have more than one install codeunit per extension, but execution order is **not guaranteed**. Each must be independent.
- **Not for upgrades**: Install code does NOT run when upgrading to a new version. Use upgrade codeunits (`Subtype = Upgrade`) for that.
- **Performance**: Keep install code fast. Avoid long-running operations that could time out.

## Install Codeunit Design Workflow

1. **Identify initialization needs** — What data/config must exist after install?
2. **Separate concerns** — Database-wide vs per-company operations
3. **Plan fresh vs reinstall** — Different logic for each scenario
4. **Implement idempotently** — All inserts check existence first
5. **Add telemetry** — Log install for monitoring (optional)
6. **Test both paths** — Verify fresh install and reinstall scenarios

## File Naming Convention

Follow the pattern: `[Prefix]Install.Codeunit.al`

Examples:
- `BCSInstall.Codeunit.al`
- `BCSStatAccInstall.Codeunit.al`

Place in: `src/Codeunit/` or feature folder `src/[Feature]/Codeunit/`.

## Checklist

Before completing install codeunit generation:

- [ ] `Subtype = Install` set on codeunit
- [ ] Fresh install vs reinstall detection using `DataVersion`
- [ ] `OnInstallAppPerCompany` for company-specific data
- [ ] `OnInstallAppPerDatabase` for database-wide operations (if needed)
- [ ] All inserts are idempotent (check before insert)
- [ ] No UI interaction (no Message, Confirm, Page.Run)
- [ ] Setup records initialized with sensible defaults
- [ ] Reference data seeded if applicable
- [ ] Telemetry logging added (optional)
- [ ] File follows naming convention: `[Prefix]Install.Codeunit.al`

## References

For complete examples:

- [references/install-examples.md](references/install-examples.md) — Full working examples (basic install, data seeding, telemetry, reinstall handling, multi-table initialization)

### External Resources

- [Writing Extension Install Code](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-extension-install-code) — Microsoft Docs
- [NavApp Data Type](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/methods-auto/navapp/navapp-data-type) — ModuleInfo methods
- [Build Your First Extension](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-extension-example) — Extension with install and upgrade code
- [Upgrading Extensions](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-upgrading-extensions) — Upgrade codeunits (related)
