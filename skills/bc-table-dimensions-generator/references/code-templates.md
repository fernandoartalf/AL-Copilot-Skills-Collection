# Code Templates — BC Table Dimensions

Placeholders: `<Prefix>` (e.g. `PTE`), `<Table>` (e.g. `"PTE Incident Header"`), `<Mgt>` (module management codeunit), `<MasterField>` / `<MasterTable>` (e.g. `"Customer No."` / `Customer`).

## Table of contents

1. Table fields
2. Core table procedures
3. Strategy A — Standard merge (CreateDimFromDefaultDim)
4. Strategy B — Single source with fallback (centralized)
5. Card page
6. List page
7. Lines: inherit and cascade
8. Archive / read-only tables

---

## 1. Table fields

```al
// Dimensions
field(400; "Shortcut Dimension 1 Code"; Code[20])
{
    CaptionClass = '1,2,1';
    Caption = 'Shortcut Dimension 1 Code';
    DataClassification = CustomerContent;
    TableRelation = "Dimension Value".Code where("Global Dimension No." = const(1), Blocked = const(false));

    trigger OnValidate()
    begin
        Rec.ValidateShortcutDimCode(1, "Shortcut Dimension 1 Code");
    end;
}
field(401; "Shortcut Dimension 2 Code"; Code[20])
{
    CaptionClass = '1,2,2';
    Caption = 'Shortcut Dimension 2 Code';
    DataClassification = CustomerContent;
    TableRelation = "Dimension Value".Code where("Global Dimension No." = const(2), Blocked = const(false));

    trigger OnValidate()
    begin
        Rec.ValidateShortcutDimCode(2, "Shortcut Dimension 2 Code");
    end;
}
field(480; "Dimension Set ID"; Integer)
{
    Caption = 'Dimension Set ID';
    DataClassification = CustomerContent;
    Editable = false;
    TableRelation = "Dimension Set Entry";

    trigger OnLookup()
    begin
        Rec.ShowDimensions();
    end;

    trigger OnValidate()
    begin
        DimMgt.UpdateGlobalDimFromDimSetID("Dimension Set ID", "Shortcut Dimension 1 Code", "Shortcut Dimension 2 Code");
    end;
}
```

## 2. Core table procedures

```al
procedure ValidateShortcutDimCode(FieldNumber: Integer; var ShortcutDimCode: Code[20])
begin
    DimMgt.ValidateShortcutDimValues(FieldNumber, ShortcutDimCode, "Dimension Set ID");
end;

procedure ShowShortcutDimCode(var ShortcutDimCode: array[8] of Code[20])
begin
    DimMgt.GetShortcutDimensions("Dimension Set ID", ShortcutDimCode);
end;

procedure ShowDimensions() IsChanged: Boolean
var
    OldDimSetID: Integer;
begin
    OldDimSetID := "Dimension Set ID";
    "Dimension Set ID" := DimMgt.EditDimensionSet("Dimension Set ID", StrSubstNo('%1 %2', TableCaption(), "No."));
    DimMgt.UpdateGlobalDimFromDimSetID("Dimension Set ID", "Shortcut Dimension 1 Code", "Shortcut Dimension 2 Code");
    IsChanged := OldDimSetID <> "Dimension Set ID";
end;

var
    DimMgt: Codeunit DimensionManagement;
```

## 3. Strategy A — Standard merge

Mirrors `Sales Line` and `src/penalty/tables/PTEPenaltyHeader.Table.al`. All master sources are merged; conflicts are resolved by **Default Dimension Priorities** for the chosen source code.

### Master field triggers

```al
field(10; "Customer No."; Code[20])
{
    Caption = 'Customer No.';
    DataClassification = CustomerContent;
    TableRelation = Customer;

    trigger OnValidate()
    begin
        // refresh dependent fields (name, etc.) first
        CreateDimFromDefaultDim(Rec.FieldNo("Customer No."));
    end;
}
field(15; "Vehicle Resource No."; Code[20])
{
    Caption = 'Vehicle Resource No.';
    DataClassification = CustomerContent;
    TableRelation = Resource where(Type = const(Machine));

    trigger OnValidate()
    begin
        CreateDimFromDefaultDim(Rec.FieldNo("Vehicle Resource No."));
    end;
}
```

### Procedures

```al
procedure CreateDimFromDefaultDim(FieldNo: Integer)
var
    DefaultDimSource: List of [Dictionary of [Integer, Code[20]]];
begin
    InitDefaultDimensionSources(DefaultDimSource, FieldNo);
    if DimMgt.IsDefaultDimDefinedForTable(GetTableValuePair(FieldNo)) then
        CreateDim(DefaultDimSource);
end;

procedure CreateDim(DefaultDimSource: List of [Dictionary of [Integer, Code[20]]])
var
    SourceCodeSetup: Record "Source Code Setup";
begin
    SourceCodeSetup.Get();
    "Shortcut Dimension 1 Code" := '';
    "Shortcut Dimension 2 Code" := '';
    "Dimension Set ID" :=
        DimMgt.GetRecDefaultDimID(
            Rec, CurrFieldNo, DefaultDimSource, SourceCodeSetup.Sales,
            "Shortcut Dimension 1 Code", "Shortcut Dimension 2 Code", 0, 0);
    DimMgt.UpdateGlobalDimFromDimSetID("Dimension Set ID", "Shortcut Dimension 1 Code", "Shortcut Dimension 2 Code");
end;

local procedure GetTableValuePair(FieldNo: Integer) TableValuePair: Dictionary of [Integer, Code[20]]
begin
    case true of
        FieldNo = Rec.FieldNo("Customer No."):
            TableValuePair.Add(Database::Customer, Rec."Customer No.");
        FieldNo = Rec.FieldNo("Vehicle Resource No."):
            TableValuePair.Add(Database::Resource, Rec."Vehicle Resource No.");
    end;
end;

procedure InitDefaultDimensionSources(var DefaultDimSource: List of [Dictionary of [Integer, Code[20]]]; FieldNo: Integer)
begin
    // Add EVERY source, flag the one that triggered the change.
    DimMgt.AddDimSource(DefaultDimSource, Database::Customer, Rec."Customer No.", FieldNo = Rec.FieldNo("Customer No."));
    DimMgt.AddDimSource(DefaultDimSource, Database::Resource, Rec."Vehicle Resource No.", FieldNo = Rec.FieldNo("Vehicle Resource No."));
end;
```

Common table mappings: `Customer`, `Vendor`, `Item`, `Resource`, `Job`, `Location`, `Employee`, `"Salesperson/Purchaser"`, `"Responsibility Center"`, `"Fixed Asset"`, `"G/L Account"`.

Two fields pointing to the same master table (e.g. Vehicle and Driver both `Resource`) are both added; the priority table cannot distinguish them — if one must win, use Strategy B.

### Optional extensibility (only if the module already publishes events)

```al
[IntegrationEvent(false, false)]
local procedure OnAfterInitDefaultDimensionSources(var Rec: Record <Table>; var DefaultDimSource: List of [Dictionary of [Integer, Code[20]]]; FieldNo: Integer)
begin
end;
```

## 4. Strategy B — Single source with fallback

Mirrors `src/incident/codeunits/PTEIncidentMgt.Codeunit.al`. Exactly one master record provides the dimensions.

### Table triggers (every field in the fallback chain)

```al
trigger OnValidate()
begin
    if "Vehicle Resource No." = '' then
        "Vehicle Name" := ''
    else begin
        Resource.Get("Vehicle Resource No.");
        "Vehicle Name" := Resource.Name;
    end;
    <Prefix>Mgt.ApplyDefaultDimensions(Rec);
end;
```

### Mgt codeunit

```al
procedure ApplyDefaultDimensions(var <Entity>: Record <Table>)
var
    SourceCodeSetup: Record "Source Code Setup";
    DimMgt: Codeunit DimensionManagement;
    DefaultDimSource: List of [Dictionary of [Integer, Code[20]]];
    DimSource: Dictionary of [Integer, Code[20]];
    SourceResourceNo: Code[20];
    SourceCode: Code[10];
begin
    <Entity>."Dimension Set ID" := 0;
    <Entity>."Shortcut Dimension 1 Code" := '';
    <Entity>."Shortcut Dimension 2 Code" := '';

    SourceResourceNo := GetDimensionSourceResourceNo(<Entity>);
    if SourceResourceNo = '' then
        exit;

    DimSource.Add(Database::Resource, SourceResourceNo);
    DefaultDimSource.Add(DimSource);
    if SourceCodeSetup.Get() then
        SourceCode := SourceCodeSetup.Sales;

    <Entity>."Dimension Set ID" :=
        DimMgt.GetDefaultDimID(
            DefaultDimSource, SourceCode,
            <Entity>."Shortcut Dimension 1 Code", <Entity>."Shortcut Dimension 2 Code", 0, 0);
    DimMgt.UpdateGlobalDimFromDimSetID(
        <Entity>."Dimension Set ID", <Entity>."Shortcut Dimension 1 Code", <Entity>."Shortcut Dimension 2 Code");
end;

procedure GetDimensionSourceResourceNo(<Entity>: Record <Table>): Code[20]
begin
    if <Entity>."Vehicle Resource No." <> '' then
        exit(<Entity>."Vehicle Resource No.");
    exit(<Entity>."Driver Resource No.");
end;
```

Mixed-table fallback (e.g. Resource, else Customer): return a `Dictionary of [Integer, Code[20]]` from the resolver instead of a `Code[20]`, and add it to `DefaultDimSource`.

## 5. Card page

### Layout

```al
group(Dimensions)
{
    Caption = 'Dimensions';

    field("Shortcut Dimension 1 Code"; Rec."Shortcut Dimension 1 Code")
    {
        ApplicationArea = Dimensions;
        ToolTip = 'Specifies the code for Shortcut Dimension 1, which is one of two global dimension codes that you set up in the General Ledger Setup window.';
        Visible = DimVisible1;
    }
    field("Shortcut Dimension 2 Code"; Rec."Shortcut Dimension 2 Code")
    {
        ApplicationArea = Dimensions;
        ToolTip = 'Specifies the code for Shortcut Dimension 2, which is one of two global dimension codes that you set up in the General Ledger Setup window.';
        Visible = DimVisible2;
    }
    field(ShortcutDimCode3; ShortcutDimCode[3])
    {
        ApplicationArea = Dimensions;
        ToolTip = 'Specifies the code for Shortcut Dimension 3, which is one of the additional shortcut dimension codes that you set up in the General Ledger Setup window.';
        CaptionClass = '1,2,3';
        TableRelation = "Dimension Value".Code where("Global Dimension No." = const(3), "Dimension Value Type" = const(Standard), Blocked = const(false));
        Visible = DimVisible3;

        trigger OnValidate()
        begin
            Rec.ValidateShortcutDimCode(3, ShortcutDimCode[3]);
        end;
    }
    // Repeat ShortcutDimCode4..ShortcutDimCode8 changing the index, CaptionClass '1,2,N',
    // "Global Dimension No." = const(N) and Visible = DimVisibleN.
    field("Dimension Set ID"; Rec."Dimension Set ID")
    {
        ApplicationArea = Dimensions;
        ToolTip = 'Specifies the dimension set ID.';
        Visible = false;
    }
}
```

On master data fields that trigger inheritance, refresh slots 3–8 immediately:

```al
field("Vehicle Resource No."; Rec."Vehicle Resource No.")
{
    ApplicationArea = All;
    ToolTip = 'Specifies the vehicle resource.';

    trigger OnAfterValidate()
    begin
        Rec.ShowShortcutDimCode(ShortcutDimCode);
    end;
}
```

### Action

```al
action(Dimensions)
{
    ApplicationArea = Dimensions;
    Caption = 'Dimensions';
    Image = Dimensions;
    ShortCutKey = 'Alt+D';
    ToolTip = 'View or edit dimensions, such as area, project, or department, that you can assign to this record.';

    trigger OnAction()
    begin
        Rec.ShowDimensions();
        CurrPage.SaveRecord();
        Rec.ShowShortcutDimCode(ShortcutDimCode);
    end;
}
```

Promote with `actionref(Dimensions_Promoted; Dimensions) { }` in `area(Promoted)` if the page uses promoted categories.

### Triggers, visibility and variables

```al
trigger OnOpenPage()
begin
    SetDimensionsVisibility();
end;

trigger OnAfterGetRecord()
begin
    Rec.ShowShortcutDimCode(ShortcutDimCode);
end;

trigger OnNewRecord(BelowxRec: Boolean)
begin
    Clear(ShortcutDimCode);
end;

local procedure SetDimensionsVisibility()
var
    DimMgt: Codeunit DimensionManagement;
begin
    DimVisible1 := false;
    DimVisible2 := false;
    DimVisible3 := false;
    DimVisible4 := false;
    DimVisible5 := false;
    DimVisible6 := false;
    DimVisible7 := false;
    DimVisible8 := false;

    // Each flag becomes true only when the slot is configured in General Ledger Setup.
    DimMgt.UseShortcutDims(
        DimVisible1, DimVisible2, DimVisible3, DimVisible4, DimVisible5, DimVisible6, DimVisible7, DimVisible8);
end;

var
    ShortcutDimCode: array[8] of Code[20];
    DimVisible1: Boolean;
    DimVisible2: Boolean;
    DimVisible3: Boolean;
    DimVisible4: Boolean;
    DimVisible5: Boolean;
    DimVisible6: Boolean;
    DimVisible7: Boolean;
    DimVisible8: Boolean;
```

## 6. List page

```al
field("Shortcut Dimension 1 Code"; Rec."Shortcut Dimension 1 Code")
{
    ApplicationArea = Dimensions;
    ToolTip = 'Specifies the code for Shortcut Dimension 1, which is one of two global dimension codes that you set up in the General Ledger Setup window.';
    Visible = false;
}
field("Shortcut Dimension 2 Code"; Rec."Shortcut Dimension 2 Code")
{
    ApplicationArea = Dimensions;
    ToolTip = 'Specifies the code for Shortcut Dimension 2, which is one of two global dimension codes that you set up in the General Ledger Setup window.';
    Visible = false;
}
```

Add the `Dimensions` action (§5) to the list as well when users edit from the list.

## 7. Lines: inherit and cascade

### Line `OnInsert` — inherit header set

```al
trigger OnInsert()
var
    Header: Record <HeaderTable>;
begin
    if ("Dimension Set ID" = 0) and Header.Get("Document No.") then begin
        "Shortcut Dimension 1 Code" := Header."Shortcut Dimension 1 Code";
        "Shortcut Dimension 2 Code" := Header."Shortcut Dimension 2 Code";
        "Dimension Set ID" := Header."Dimension Set ID";
    end;
end;
```

### Line with its own master data — combine with header

In the line `CreateDim`, pass the header set as inherit source:

```al
"Dimension Set ID" :=
    DimMgt.GetRecDefaultDimID(
        Rec, CurrFieldNo, DefaultDimSource, SourceCodeSetup.Sales,
        "Shortcut Dimension 1 Code", "Shortcut Dimension 2 Code",
        Header."Dimension Set ID", Database::<HeaderTable>);
```

### Header → lines cascade (Work Worksheet pattern)

Call after `ValidateShortcutDimValues`, `EditDimensionSet` and `CreateDim` on the header:

```al
procedure CascadeDimensionsToLines(var Header: Record <HeaderTable>)
var
    Line: Record <LineTable>;
begin
    Line.SetRange("Document No.", Header."No.");
    if Line.FindSet(true) then
        repeat
            Line."Dimension Set ID" := Header."Dimension Set ID";
            Line."Shortcut Dimension 1 Code" := Header."Shortcut Dimension 1 Code";
            Line."Shortcut Dimension 2 Code" := Header."Shortcut Dimension 2 Code";
            Line.Modify(true);
        until Line.Next() = 0;
end;
```

If lines can carry their own dimensions, prefer the standard approach (`DimMgt.GetDeltaDimSetID(Line."Dimension Set ID", NewParentDimSetID, OldParentDimSetID)`) with a confirmation, as Sales Header `UpdateAllLineDim` does, instead of overwriting.

## 8. Archive / read-only tables

Same field IDs and `CaptionClass`, no `OnValidate` logic beyond `UpdateGlobalDimFromDimSetID`. Read-only viewer:

```al
procedure ShowDimensions()
begin
    DimMgt.ShowDimensionSet("Dimension Set ID", StrSubstNo('%1 %2', TableCaption(), "No."));
end;
```

Archive card: same `Dimensions` group with `Editable = false` and no `OnValidate` on `ShortcutDimCode[N]`.
