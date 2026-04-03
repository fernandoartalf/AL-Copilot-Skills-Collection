---
name: bc-number-series-generator
description: Implements automatic number series assignment for custom tables in Business Central following BC standard patterns. Creates setup tables with number series fields, table extensions with AssistEdit procedures, OnBeforeInsert/OnBeforeRename triggers, and page extensions with AssistEdit integration. Handles both manual and automatic number assignment with support for related series. Use when asked to add number series, implement automatic numbering, add series to custom tables, create No. fields with series, or implement BC standard numbering patterns.
---

# Business Central Number Series Generator

Implements automatic number series assignment on custom tables following Microsoft's standard patterns. Generates setup tables, table extensions with triggers, and UI integration for seamless number series management.

## Quick Start

### 1. Setup Table Pattern

```al
table [ID] "[Prefix] [Module] Setup"
{
    Caption = '[Module] Setup';
    DataClassification = ToBeClassified;
    DrillDownPageID = "[Prefix] [Module] Setup";
    LookupPageID = "[Prefix] [Module] Setup";
    
    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            AllowInCustomizations = Never;
            Caption = 'Primary Key';
        }
        field(2; "[Entity] Nos."; Code[20])
        {
            Caption = '[Entity] Nos.';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
    }
    
    keys
    {
        key(PK; "Primary Key")
        {
            Clustered = true;
        }
    }
}
```

### 2. Table Extension with Number Series Logic

```al
tableextension [ID] "[Prefix] [Entity]" extends "[Base Table]"
{
    fields
    {
        field([ID]; "[Prefix] No. Series"; Code[20])
        {
            Caption = 'No. Series';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
    }
    
    trigger OnBeforeInsert()
    begin
        if "No." = '' then begin
            [Prefix]Setup.Get();
            [Prefix]Setup.TestField("[Entity] Nos.");
            if NoSeries.AreRelated([Prefix]Setup."[Entity] Nos.", xRec."[Prefix] No. Series") then
                "[Prefix] No. Series" := xRec."[Prefix] No. Series"
            else
                "[Prefix] No. Series" := [Prefix]Setup."[Entity] Nos.";
            "No." := NoSeries.GetNextNo("[Prefix] No. Series");
        end;
    end;
    
    trigger OnBeforeRename()
    begin
        if "No." = '' then begin
            [Prefix]Setup.Get();
            [Prefix]Setup.TestField("[Entity] Nos.");
            if NoSeries.AreRelated([Prefix]Setup."[Entity] Nos.", Rec."[Prefix] No. Series") then
                "[Prefix] No. Series" := Rec."[Prefix] No. Series"
            else
                "[Prefix] No. Series" := [Prefix]Setup."[Entity] Nos.";
            "No." := NoSeries.GetNextNo("[Prefix] No. Series");
        end;
    end;
    
    procedure AssistEdit(): Boolean
    begin
        if not [Prefix]Setup.Get() then
            exit(false);
        if NoSeries.LookupRelatedNoSeries([Prefix]Setup."[Entity] Nos.", xRec."[Prefix] No. Series", "[Prefix] No. Series") then
            "No." := NoSeries.GetNextNo("[Prefix] No. Series");
    end;
    
    var
        [Prefix]Setup: Record "[Prefix] [Module] Setup";
        NoSeries: Codeunit "No. Series";
}
```

### 3. Page Extension with AssistEdit

```al
pageextension [ID] "[Prefix] [Entity] Card" extends "[Base Card Page]"
{
    layout
    {
        modify("No.")
        {
            trigger OnAssistEdit()
            begin
                if Rec.AssistEdit() then
                    CurrPage.Update();
            end;
        }
    }
}
```

### 4. Setup Page Pattern

```al
page [ID] "[Prefix] [Module] Setup"
{
    ApplicationArea = Basic, Suite;
    Caption = '[Module] Setup';
    PageType = Card;
    SourceTable = "[Prefix] [Module] Setup";
    DeleteAllowed = false;
    InsertAllowed = false;
    UsageCategory = Administration;
    
    layout
    {
        area(Content)
        {
            group("Number Series")
            {
                Caption = 'Number Series';
                field("[Entity] Nos."; Rec."[Entity] Nos.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the number series used for [Entity].';
                }
            }
        }
    }
    
    trigger OnOpenPage()
    begin
        Rec.Reset();
        if not Rec.Get() then begin
            Rec.Init();
            Rec.Insert();
        end;
    end;
}
```

## Prerequisites

- Custom table with a `"No."` field (primary key or main identifier)
- Available object ID ranges for setup table, page, and extension objects
- Understanding of module/feature structure
- Prefix convention established (e.g., BCS, CUSTOM, etc.)

## Implementation Workflow

1. **Create Setup Table** — Single-record table with primary key + number series field(s)
2. **Create Setup Page** — Card page with auto-initialization on OnOpenPage
3. **Create Table Extension** — Add "No. Series" field + OnBeforeInsert/OnBeforeRename triggers + AssistEdit procedure
4. **Create Page Extension** — Wire up AssistEdit trigger on "No." field
5. **Test Behavior** — Verify automatic assignment, manual override, AssistEdit lookup, and related series handling

## Number Series Patterns

### Pattern 1: Simple Number Series (Single Entity)

**Use Case**: One entity type needs automatic numbering (e.g., Statistical Accounts)

**Setup Table**:
```al
field(2; "Statistical Account Nos."; Code[20])
{
    Caption = 'Statistical Account Nos.';
    TableRelation = "No. Series";
}
```

**Logic**: Direct assignment from setup field to record.

### Pattern 2: Multiple Number Series (Multiple Entity Types)

**Use Case**: Multiple related entities in same module (e.g., Sales Orders, Sales Quotes, Sales Invoices)

**Setup Table**:
```al
field(2; "Order Nos."; Code[20])
{
    Caption = 'Order Nos.';
    TableRelation = "No. Series";
}
field(3; "Quote Nos."; Code[20])
{
    Caption = 'Quote Nos.';
    TableRelation = "No. Series";
}
field(4; "Invoice Nos."; Code[20])
{
    Caption = 'Invoice Nos.';
    TableRelation = "No. Series";
}
```

**Logic**: Use document type or entity discriminator to select appropriate series.

### Pattern 3: Related Number Series

**Use Case**: Series variations (e.g., STAT for manual, STAT-AUTO for automatic)

**Logic**: Use `NoSeries.AreRelated()` to check if user-selected series is valid:

```al
if NoSeries.AreRelated(Setup."Default Nos.", xRec."No. Series") then
    "No. Series" := xRec."No. Series"
else
    "No. Series" := Setup."Default Nos.";
```

**Benefit**: Allows users to select different series from the same family without losing automatic assignment.

## Key NoSeries Codeunit Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `GetNextNo(SeriesCode)` | Get next number from series | `"No." := NoSeries.GetNextNo("BCS No. Series");` |
| `AreRelated(Series1, Series2)` | Check if two series are related | `if NoSeries.AreRelated(Setup."Nos.", xRec."No. Series")` |
| `LookupRelatedNoSeries(DefaultSeries, OldSeries, NewSeries)` | AssistEdit lookup for related series | `NoSeries.LookupRelatedNoSeries(Setup."Nos.", xRec."No. Series", "No. Series")` |

## Trigger Behavior

**Object Type Distinction**:
- **Table objects**: Use `OnInsert`, `OnRename`, `OnDelete` triggers
- **Table extensions**: Use `OnBeforeInsert`, `OnBeforeRename`, `OnBeforeDelete` triggers

Since number series are typically added to existing BC tables, **table extensions** are the standard approach using the "OnBefore" trigger variants.

### OnBeforeInsert (Table Extensions) / OnInsert (Tables)

**When**: Before new record is inserted into the database  
**Purpose**: Automatically assign the next number if "No." is blank  
**Pattern**:
1. Check if `"No." = ''`
2. Get setup record and validate series field
3. Check for related series (user may have changed)
4. Assign next number from series

**Usage**:
- `OnBeforeInsert`: Use in **tableextension** objects extending base tables
- `OnInsert`: Use in **table** objects you create from scratch

### OnBeforeRename (Table Extensions) / OnRename (Tables)

**When**: Before primary key is renamed (changing "No.")  
**Purpose**: Handle renaming with automatic number assignment  
**Pattern**: Same as OnBeforeInsert but uses `Rec."No. Series"` instead of `xRec."No. Series"`

**Usage**:
- `OnBeforeRename`: Use in **tableextension** objects extending base tables
- `OnRename`: Use in **table** objects you create from scratch

**Note**: OnBeforeRename/OnRename is less common but ensures consistency if users attempt to rename the key field.

## AssistEdit Procedure

**Purpose**: Provides lookup (F6/DrillDown) on "No." field to select from related series

**Implementation**:
```al
procedure AssistEdit(): Boolean
begin
    if not [Prefix]Setup.Get() then
        exit(false);
    if NoSeries.LookupRelatedNoSeries([Prefix]Setup."[Entity] Nos.", xRec."[Prefix] No. Series", "[Prefix] No. Series") then
        "No." := NoSeries.GetNextNo("[Prefix] No. Series");
end;
```

**UI Integration**:
```al
modify("No.")
{
    trigger OnAssistEdit()
    begin
        if Rec.AssistEdit() then
            CurrPage.Update();
    end;
}
```

**User Experience**: Clicking DrillDown (F6) or AssistEdit button opens number series selection, filters to related series only.

## Setup Page Initialization

**Goal**: Ensure setup record always exists

**Pattern**:
```al
trigger OnOpenPage()
begin
    Rec.Reset();
    if not Rec.Get() then begin
        Rec.Init();
        Rec.Insert();
    end;
end;
```

**Why**: Setup tables are typically single-record tables. This pattern auto-creates the record on first access, avoiding "record not found" errors.

## Checklist

Before completing number series implementation:

- [ ] Setup table created with "Primary Key" and "[Entity] Nos." fields
- [ ] Setup page created with auto-initialization trigger
- [ ] Table extension adds "[Prefix] No. Series" field
- [ ] OnBeforeInsert trigger implements automatic numbering
- [ ] OnBeforeRename trigger handles renaming (optional but recommended)
- [ ] AssistEdit procedure implemented in table extension
- [ ] Page extension wires up OnAssistEdit trigger on "No." field
- [ ] Tested automatic number assignment (leave "No." blank)
- [ ] Tested manual number override (enter "No." manually)
- [ ] Tested AssistEdit lookup (DrillDown on "No." field)
- [ ] Tested related series handling (if using series families)
- [ ] Setup page accessible via search (UsageCategory = Administration)

## Common Variations

### Variation 1: Conditional Numbering

**Use Case**: Only apply automatic numbering if certain conditions are met (e.g., document type, status)

**Pattern**:
```al
trigger OnBeforeInsert()
begin
    if ("No." = '') and (ShouldAutoNumber()) then begin
        // Standard numbering logic
    end;
end;

local procedure ShouldAutoNumber(): Boolean
begin
    // Custom logic (e.g., check document type, feature flag, etc.)
    exit(true);
end;
```

### Variation 2: Multiple Series per Entity

**Use Case**: Different series based on type/category (e.g., Internal Projects use PROJ-INT, External use PROJ-EXT)

**Setup Table**:
```al
field(2; "Internal Project Nos."; Code[20]) { TableRelation = "No. Series"; }
field(3; "External Project Nos."; Code[20]) { TableRelation = "No. Series"; }
```

**Logic**:
```al
trigger OnBeforeInsert()
begin
    if "No." = '' then begin
        Setup.Get();
        case "Project Type" of
            "Project Type"::Internal:
                begin
                    Setup.TestField("Internal Project Nos.");
                    "No. Series" := Setup."Internal Project Nos.";
                end;
            "Project Type"::External:
                begin
                    Setup.TestField("External Project Nos.");
                    "No. Series" := Setup."External Project Nos.";
                end;
        end;
        "No." := NoSeries.GetNextNo("No. Series");
    end;
end;
```

### Variation 3: Header-Lines Pattern

**Use Case**: Lines inherit series context from header (e.g., Sales Order Lines reference header's series)

**Header**:
```al
trigger OnBeforeInsert()
begin
    if "No." = '' then begin
        Setup.Get();
        Setup.TestField("Order Nos.");
        "No. Series" := Setup."Order Nos.";
        "No." := NoSeries.GetNextNo("No. Series");
    end;
end;
```

**Lines**: No numbering logic needed — lines reference header via foreign key.

## References

For complete working examples:

- [references/number-series-examples.md](references/number-series-examples.md) — Full Statistical Accounts implementation, multiple series patterns, API integration
- [references/number-series-troubleshooting.md](references/number-series-troubleshooting.md) — Common errors, debugging tips, performance considerations

### External Resources

- [Blog: BC Way - Add series numbers on Custom Tables](https://www.businesscentralscout.com/2025/10/bc-way-add-series-numbers-on-custom.html) — Original pattern source
- [Microsoft Docs: Number Series](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-number-series) — Official documentation
- [GitHub: BC-Scout-Path Repository](https://github.com/fernandoartalf/BC-Scout-Path) — Reference implementation
