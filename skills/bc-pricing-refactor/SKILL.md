---
name: bc-pricing-refactor
description: >
  Guides AL developers through refactoring Business Central legacy sales pricing
  (Sales Price table 7002 / Sales Line Discount table 7004) to the new Price List
  architecture (Price List Header table 7000 / Price List Line table 7001).
  Use this skill when asked to: migrate pricing customizations, extend the new
  Price Calculation engine, understand the PriceCalculation interface, map old
  codeunits to new ones, scaffold price list AL objects, or plan the Feature
  Management enablement strategy for the New Sales Pricing Experience.
  Triggers: "refactor prices", "migrate sales price", "new pricing experience",
  "Price List Header", "Price List Line", "extend price calculation", "PriceCalculation interface",
  "legacy pricing BC", "tabla 7002", "tabla 7000", "Feature Update pricing".
---

# BC Pricing Refactor Skill

## Purpose

This skill provides structured guidance for migrating Business Central
customizations from the legacy pricing model (pre-2020) to the
New Sales Pricing Experience.

The guidance is intentionally version-agnostic. Before implementing code,
verify object names, event publishers, interface signatures, and page IDs
against the symbols of your target runtime.

Treat rollout timing and feature availability as environment-specific. Confirm
the current platform behavior and deprecation state in the official Microsoft
documentation for the target runtime before planning a migration.

---

## Context: What Changed and Why

| Concept | Legacy (<= BC19) | New Experience (BC20+) |
|---|---|---|
| Sales prices table | `Sales Price` (7002) | `Price List Line` (7001) |
| Discounts table | `Sales Line Discount` (7004) | `Price List Line` (7001) |
| Price list header | None | `Price List Header` (7000) |
| Calculation engine | `Sales Price Calc. Mgt.` (7000) | `Price Calculation` interface + V16 codeunit |
| Extensibility | Events on codeunit 7000 | AL Interface + Enum extension |
| Activation | Always on | Feature Management toggle (irreversible) |
| Status workflow | N/A | Draft -> Active -> Inactive |

### Official Microsoft References
- Functional guide: https://learn.microsoft.com/en-us/dynamics365/business-central/across-prices-and-discounts
- Release Plan Wave 2 2020: https://learn.microsoft.com/en-us/dynamics365-release-plan/2020wave2/smb/dynamics365-business-central/use-new-sales-pricing-experience-
- Release Plan Wave 1 2020 (engine): https://learn.microsoft.com/en-us/dynamics365-release-plan/2020wave1/dynamics365-business-central/extend-price-calculation
- Developer - Extending Price Calculations: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-extending-best-price-calculations
- Extensibility Overview: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-extensibility-overview

---

## Step-by-Step Refactoring Workflow

Follow these steps in order. Do not skip Step 0.

### Step 0 - Audit existing customizations

Before writing a single line of AL, produce an inventory:

1. Search the codebase for direct references to legacy objects:
   - Table `"Sales Price"` (ID 7002)
   - Table `"Sales Line Discount"` (ID 7004)
   - Codeunit `"Sales Price Calc. Mgt."` (ID 7000)
   - Page `"Sales Prices"` (ID 7002)
   - Page `"Sales Line Discounts"` (ID 7004)
2. Document each reference: object type, purpose, events subscribed, fields used.
3. Classify each as: Read, Write, UI Extension, or Business Logic.
4. Check if the Feature Update is already enabled in the target environment
   (`Feature Management` page -> search "New sales pricing experience").

Once the Feature Update is enabled it cannot be disabled.
Always test first in a sandbox environment.

See `references/audit-checklist.md` for a printable checklist.

---

### Step 1 - Map legacy objects to new objects

| Legacy object | New equivalent |
|---|---|
| `Sales Price` (7002) | `Price List Line` (7001) with `Price Type = Sale` |
| `Sales Line Discount` (7004) | `Price List Line` (7001) with `Amount Type = Discount` |
| `Sales Price Calc. Mgt.` (7000) | `Price Calculation - V16` codeunit + `Price Calculation` interface |
| `Customer Price Group` | `Price Source Type` enum value `Customer Price Group` |
| `Campaign` | `Price Source Type` enum value `Campaign` |

New key fields on `Price List Header` (7000):
- `Status`: Draft / Active / Inactive
- `Price Type`: Sale / Purchase
- `Source Type` / `Source No.`: who the list applies to
- `Allow Updating Defaults`: controls line-level overrides
- `Currency Code`: one per header (lines cannot mix currencies)

New key fields on `Price List Line` (7001):
- `Amount Type`: Price / Discount / Any
- `Asset Type`: Item / Resource / G/L Account / Item Discount Group
- `Asset No.`
- `Minimum Quantity`
- `Unit Price` / `Line Discount %` / `Unit Cost`

---

### Step 2 - Extend the Price Calculation engine (if needed)

Use this step only if your customization adds a new pricing method
(for example, contract pricing, tiered pricing, or location-based pricing).
For simple data migrations, skip to Step 3.

#### 2a. Implement the `Price Calculation` interface

Use the following snippet as a structural template only. Interface
signatures can vary between runtimes, so first inspect the interface in your
target symbols and then mirror that exact contract.

```al
codeunit 50100 "My Price Calculation" implements "Price Calculation"
{
    procedure FindPrice(Line: Variant; AmountType: Enum "Price Amount Type"): Boolean
    begin
        // Your custom price lookup logic here
    end;

    procedure ApplyPrice(AmountType: Enum "Price Amount Type"; var Line: Variant)
    begin
        // Apply the found price to the document line
    end;

    procedure ApplyDiscount(var Line: Variant)
    begin
        // Apply the found discount to the document line
    end;

    procedure CountDiscount(ShowAll: Boolean): Integer
    begin
        exit(0);
    end;

    procedure CountPrice(ShowAll: Boolean): Integer
    begin
        exit(0);
    end;

    procedure GetLine(var Line: Variant)
    begin
    end;

    procedure Init(NewSalesHeader: Variant; var PriceCalculationSetup: Record "Price Calculation Setup")
    begin
    end;

    procedure IsDiscountAllowed(FieldName: Text; var IsHandled: Boolean)
    begin
    end;

    procedure PickDiscount()
    begin
    end;

    procedure PickPrice()
    begin
    end;

    procedure ShowPrices(Line: Variant)
    begin
    end;
}
```

#### 2b. Extend the `Price Calculation Method` enum

```al
enumextension 50100 "My Price Method Ext" extends "Price Calculation Method"
{
    value(50100; "My Custom Method")
    {
        Caption = 'My Custom Method';
        Implementation = "Price Calculation" = "My Price Calculation";
    }
}
```

#### 2c. Register the new method in Price Calculation Setup

```al
codeunit 50101 "My Price Setup Subscriber"
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Price Calculation Mgt.",
        'OnFindSupportedSetup', '', false, false)]
    local procedure OnFindSupportedSetup(
        var TempPriceCalculationSetup: Record "Price Calculation Setup" temporary)
    begin
        TempPriceCalculationSetup.InsertDuplicate(
            Enum::"Price Calculation Method"::"My Custom Method",
            Enum::"Price Type"::Sale,
            Enum::"Price Asset Type"::Item,
            Codeunit::"My Price Calculation",
            true);
    end;
}
```

See `references/custom-price-method.al` for a version-agnostic scaffold.

---

### Step 3 - Extend the `Price Source Type` enum (if needed)

Use this step if your customization introduces a new applies-to dimension
(for example, Location, Department, or Contract).

```al
enumextension 50102 "My Source Type Ext" extends "Price Source Type"
{
    value(50102; "My Location")
    {
        Caption = 'Location';
        Implementation = "Price Source" = "My Location Price Source";
    }
}

enumextension 50103 "My Sales Source Type Ext" extends "Sales Price Source Type"
{
    value(50102; "My Location") { }
}
```

The base extension points you typically need are:
- `Price Source Type` (Enum)
- `Sales Price Source Type` (Enum)
- `Price Source` (Interface)

Do not scaffold the `Price Source` implementation from memory. Inspect the
exact procedure contract in your target symbol package first and mirror that
signature set in your codeunit implementation.

---

### Step 4 - Handle data migration

When the Feature Update is enabled, BC can auto-migrate existing data from
tables 7002 and 7004 into the new Price List structure. However, custom
fields added by extensions must be handled separately.

#### Auto-migration (standard data)
BC creates a default price list from existing `Sales Price` and
`Sales Line Discount` records automatically on Feature Update enablement.
No code needed for standard fields.

#### Custom field migration
```al
codeunit 50104 "My Pricing Data Migration"
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Price List Management",
        '<verified migration event name here>', '', false, false)]
    local procedure HandleVerifiedMigrationEvent(
        SalesPrice: Record "Sales Price";
        var PriceListLine: Record "Price List Line")
    begin
        PriceListLine."My Custom Field" := SalesPrice."My Legacy Field";
        PriceListLine.Modify(false);
    end;
}
```

See `references/migration-events.md` for the extensibility points and the
discovery workflow to confirm migration publishers with AL symbols.

---

### Step 5 - Update UI extensions

Legacy pages `"Sales Prices"` (7002) and `"Sales Line Discounts"` (7004)
are no longer shown when the new experience is active.
Replace page extensions targeting those pages with extensions on the current
price list UI objects in your runtime, typically:
- `"Sales Price List"` - main list page
- `"Price List Lines"` - lines subpage
- `"Price Worksheet"` - bulk update page

```al
pageextension 50201 "My Price List Line Ext" extends "Price List Lines"
{
    layout
    {
        addafter("Unit Price")
        {
            field("My Field"; Rec."My Field") { }
        }
    }
}
```

---

### Step 6 - Validation and testing checklist

Before deploying to production, verify:

- [ ] Feature Update enabled in sandbox - no compilation errors
- [ ] Standard sales orders calculate prices correctly (unit price, discount %)
- [ ] Customer-specific prices are found and applied
- [ ] Customer Price Group prices are applied when no customer-specific price exists
- [ ] Campaign prices activate/deactivate correctly by date
- [ ] Purchase price lists work independently from sales
- [ ] Custom price method appears in `Price Calculation Method` lookup
- [ ] Custom Source Type appears in Price List Header `Source Type` field
- [ ] Price list Status workflow: Draft -> Active -> (optionally) Inactive
- [ ] `Verify Lines` action finds no duplicates or conflicts
- [ ] `Price Worksheet` page correctly suggests and updates lines
- [ ] Custom fields migrated from legacy tables are present and correct
- [ ] AL tests pass (see `references/price-calculation-test.al`)

---

## Common Mistakes to Avoid

| Mistake | Correct approach |
|---|---|
| Subscribing to events on `Sales Price Calc. Mgt.` (7000) | Implement the `Price Calculation` interface instead |
| Reading directly from table 7002 or 7004 | Query `Price List Line` (7001) filtered by `Price Type` |
| Enabling Feature Update in production before testing | Always test in sandbox first - it is irreversible |
| Creating price list lines with different currency codes on same header | One currency code per `Price List Header` |
| Forgetting to set `Status = Active` on new price lists | Inactive lists are silently ignored by the engine |
| Extending `Sales Price Source Type` without also extending `Price Source Type` | Both enums must be extended simultaneously |

---

## Quick Reference: Key AL Objects

Use this table as a discovery shortcut, not as a substitute for symbol
verification in the target environment.

| Object | Type | ID | Purpose |
|---|---|---|---|
| `Price List Header` | Table | 7000 | Price list metadata and defaults |
| `Price List Line` | Table | 7001 | Individual price/discount rules |
| `Price Calculation` | Interface | - | Contract for all price engines |
| `Price Calculation Method` | Enum | - | Selects which engine to use |
| `Price Source Type` | Enum | - | Defines applies-to dimension |
| `Price Calculation - V16` | Codeunit | runtime-specific | Standard new-engine implementation |
| `Price Calculation Mgt.` | Codeunit | runtime-specific | Orchestrates engine selection |
| `Price List Management` | Codeunit | runtime-specific | Migration and management helpers |
| `Sales Price List` | Page | runtime-specific | Main UI for sales price lists |
| `Price List Lines` | Page | runtime-specific | Lines subpage |
| `Price Worksheet` | Page | runtime-specific | Bulk price update tool |