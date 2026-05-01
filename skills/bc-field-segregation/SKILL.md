---
name: bc-field-segregation
description: Propagates custom fields from source documents and journal lines to posted documents, archived documents, and ledger entries in Business Central. Selects between Pattern A (TransferFields — zero code, same Field ID on all TableExts) or Pattern B (EventSubscriber with dedicated codeunit per module) based on whether the posting codeunit uses TransferFields. Use when asked to add a field to Sales/Purchase/Transfer documents that must appear on posted invoices, shipments, credit memos, or archives; when propagating fields from Item Journal Line to Item Ledger Entry or Capacity Ledger Entry; when copying fields from Gen. Journal Line to Cust./Vendor/G/L Ledger Entry; when extending any BC posting chain with custom data. Trigger phrases include "add field to posted document", "copy field from header to invoice", "propagate field to ledger entry", "field segregation", "TransferFields custom field", "posting chain field extension".
---

# Business Central Field Segregation

Propagates custom fields from source documents and journal lines to posted/archived documents and ledger entries. Selects Pattern A (TransferFields — zero code) or Pattern B (EventSubscriber with dedicated codeunit) based on whether the posting codeunit calls `TransferFields`.

---

## Scope

**In scope:**
- Sales, Purchase, Transfer header and line documents → posted, archive, and return documents
- Item Journal Line → Item Ledger Entry, Capacity Ledger Entry, Value Entry
- Gen. Journal Line → Cust. Ledger Entry, Vendor Ledger Entry, G/L Entry
- Resource Journal Line → Res. Ledger Entry
- Cash Flow Worksheet Line → Cash Flow Forecast Entry
- Routing Line → Prod. Order Routing Line
- Assembly Header/Line → Posted Assembly Header/Line
- Warehouse Receipt/Shipment Line → Posted Receipt/Shipment Line
- Any other posting chain where a BC-published integration event is available

**Out of scope:**
- FlowFields and FlowFilters (they are computed, not transferred)
- Fields populated after posting by background jobs or codeunit chains not reachable via a published event
- Creating new source or target tables from scratch (use bc-setup-table-generator for that)

---

## Input

Collect this information before generating code:

| # | Item | Example |
|---|------|---------|
| 1 | Source table name and ID | `Item Journal Line` (83) |
| 2 | Field ID | `50100` |
| 3 | Field name | `MyCustomField` |
| 4 | Field type | `Text[50]` |
| 5 | Caption (English) | `My Custom Field` |
| 6 | Target tables | `Item Ledger Entry`, `Capacity Ledger Entry` |
| 7 | Module / feature name | `ItemCostAllocation` |

---

## Decision Tree — Which Pattern?

```
Open the posting codeunit for the source table.
Search for TransferFields(SourceRecord) where SourceRecord is a variable of the source table type.

Found? ─── YES ──► Pattern A (TransferFields)
                    Add field (same ID) to source + all target TableExts.
                    No subscriber needed.

Not found? ─ NO ──► Pattern B (EventSubscriber)
                    Add field (same ID) to source + all target TableExts.
                    Create one dedicated EventSubscriber codeunit per module.
                    Read references/pattern-b-event-map.md NOW to pick the event.
```

> Read **references/pattern-a-table-map.md** NOW for all Pattern A source→target mappings.
> Read **references/pattern-b-event-map.md** NOW for all Pattern B events and codeunit IDs.

---

## Quick Start — Pattern A

No subscriber code required. Add the field with the **same Field ID** to every table extension in the posting chain.

```al
// Source
tableextension 50100 "Sales Header Ext." extends "Sales Header"
{
    fields
    {
        field(50100; MyCustomField; Text[50])
        {
            Caption = 'My Custom Field';
            DataClassification = CustomerContent;
        }
    }
}

// Each posted target — same Field ID, same name, same type
tableextension 50101 "Sales Invoice Header Ext." extends "Sales Invoice Header"
{
    fields
    {
        field(50100; MyCustomField; Text[50])
        {
            Caption = 'My Custom Field';
            DataClassification = CustomerContent;
        }
    }
}

// Repeat for Sales Shipment Header, Sales Cr.Memo Header, Return Receipt Header,
// Sales Header Archive — all using field ID 50100.
```

---

## Quick Start — Pattern B

Requires three artifacts: source TableExt, target TableExt(s), and one dedicated EventSubscriber codeunit.

```al
// 1. Source TableExt
tableextension 50110 "Item Journal Line Ext." extends "Item Journal Line"
{
    fields
    {
        field(50100; MyCustomField; Text[50])
        {
            Caption = 'My Custom Field';
            DataClassification = CustomerContent;
        }
    }
}

// 2. Target TableExt — same Field ID
tableextension 50111 "Item Ledger Entry Ext." extends "Item Ledger Entry"
{
    fields
    {
        field(50100; MyCustomField; Text[50])
        {
            Caption = 'My Custom Field';
            DataClassification = CustomerContent;
        }
    }
}

// 3. Dedicated subscriber codeunit (one per module / posting chain)
codeunit 50120 "Ev Item Jnl Post [ModuleName]"
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Item Jnl.-Post Line",
        'OnBeforeInsertItemLedgEntry', '', false, false)]
    local procedure CopyFieldToItemLedgEntry(var ItemLedgerEntry: Record "Item Ledger Entry";
        ItemJournalLine: Record "Item Journal Line")
    begin
        ItemLedgerEntry.MyCustomField := ItemJournalLine.MyCustomField;
    end;
}
```

---

## Workflow

### Step 1 — Determine pattern
Open the posting codeunit for the source table. Search for `TransferFields`. Choose Pattern A or Pattern B.

### Step 2 — Collect field metadata
Confirm Field ID, name, type, and caption. The same ID must be used on every table extension.

> Read **references/pattern-a-table-map.md** NOW if Pattern A.
> Read **references/pattern-b-event-map.md** NOW if Pattern B.

### Step 3 — Create source TableExt
Add the field to the source table extension. Set `DataClassification`. Add `Caption` in English.

### Step 4 — Create target TableExt(s)
Create one TableExt per target table with the **same Field ID, name, and type**. If the target is a ledger or posted table, set `Editable = false` if the field must be read-only after posting.

### Step 5 — Create subscriber codeunit (Pattern B only)
Create one codeunit per module. Subscribe to the correct event from `references/pattern-b-event-map.md`. Copy the field value inside the subscriber. Do not mix different posting chains in the same codeunit.

### Step 6 — Verify and check
Run the pre-commit checklist at `references/field-segregation-checklist.md`. Test a real posting and confirm the field value propagates.

---

## Rule 1 — Field Identity

The Field ID, field name, data type, and length must be **identical** on the source TableExt and every target TableExt. Deviation causes data inconsistency and breaks future migration to Pattern A.

```al
// Correct — same ID 50100 on all extensions
field(50100; MyCustomField; Text[50]) // source
field(50100; MyCustomField; Text[50]) // target 1
field(50100; MyCustomField; Text[50]) // target 2

// Wrong — different IDs
field(50100; MyCustomField; Text[50]) // source
field(50200; MyCustomField; Text[50]) // target — ID mismatch
```

---

## Rule 2 — Pattern A: verify TransferFields, delete redundant subscribers

Before implementing Pattern A, confirm the posting codeunit calls `TransferFields`. If you find an existing EventSubscriber that already copies the same field, delete the subscriber — it is redundant and must not coexist with `TransferFields` for the same field.

```al
// In BC posting codeunit (simplified):
SalesInvoiceHeader.TransferFields(SalesHeader); // ← Pattern A confirmed
SalesInvoiceHeader.Insert(true);
```

---

## Rule 3 — Pattern B: one dedicated codeunit per posting chain per module

Do not put subscribers for different posting chains in the same codeunit. Do not scatter one posting chain's subscribers across multiple codeunits. One codeunit = one posting chain + one module/feature.

```al
// Correct: dedicated codeunit for Item Journal Line posting in MyModule
codeunit 50120 "Ev Item Jnl Post MyModule"
{
    // All subscribers for Item Journal Line → posted targets for MyModule go here
}

// Wrong: mixed chains in one codeunit
codeunit 50120 "Ev Post MyModule"
{
    // Item Journal subscriber ...
    // Gen. Journal subscriber ...   ← wrong, different chain
}
```

---

## Rule 4 — Event Selection for Pattern B

> Read **references/pattern-b-event-map.md** NOW before writing any subscriber.

Use the event from the map. Do not use `OnAfterInsert` directly on the target table — BC may call `Insert` multiple times (e.g., on preview or partial posting). Prefer the posting-codeunit-published event which fires exactly once per document line.

---

## Rule 5 — DataClassification

Set `DataClassification` on every field in every TableExt. Use `CustomerContent` for fields that hold user-entered business data. Never leave it unset.

```al
field(50100; MyCustomField; Text[50])
{
    Caption = 'My Custom Field';
    DataClassification = CustomerContent;
}
```

---

## Rule 6 — Editable on posted tables

Posted and ledger entry tables must have `Editable = false` on custom fields that should not be changed after posting.

```al
// Target: Sales Invoice Header TableExt
field(50100; MyCustomField; Text[50])
{
    Caption = 'My Custom Field';
    DataClassification = CustomerContent;
    Editable = false;
}
```

---

## Rule 7 — FlowFields do not transfer

`TransferFields` does not transfer FlowField values. If you need a computed total on the posted document, define a FlowField on the target TableExt with its own `CalcFormula`, or call `CalcFields` explicitly where the value is displayed.

```al
// FlowField on posted table — not transferred, self-computed
field(50101; RelatedCount; Integer)
{
    Caption = 'Related Count';
    FieldClass = FlowField;
    CalcFormula = Count("My Related Table" WHERE("Document No." = FIELD("No.")));
    Editable = false;
}
```

---

## Known Limitations

- **`Modify(false)` in subscribers**: Some BC events pass the target record by `var` but the posting codeunit calls `Insert` internally after the event. Assigning the field inside the event IS persisted because it modifies the in-memory record before `Insert`. However, if the posting code calls `Modify(false)` or skips `Modify` later, a second assignment inside an `OnAfterModify` event on the target table is needed.
- **Ledger entries created multiple times**: Some posting chains (e.g., partial shipment + invoice) insert the target record more than once. The subscriber fires for each insert — ensure the source record is always accessible in the event parameters.
- **Resource Ledger Entry**: If `OnAfterInsertResLedgEntry` is not exposed in your BC version, use `OnBeforeInsertResLedgEntry` or a wrapper integration event.
- **FlowFields on source are not copied**: Pattern A's `TransferFields` copies stored fields only. FlowFields on the source table are skipped.

---

## Anti-Patterns

| Anti-Pattern | Why It Is Wrong | Correct Approach |
|---|---|---|
| Manual field copy subscriber when posting codeunit uses `TransferFields` | Redundant — `TransferFields` already copies the value. Double-assignment, extra maintenance. | Delete the subscriber. Rely on Pattern A. |
| One subscriber codeunit mixing multiple posting chains | Hard to maintain, causes unclear responsibility boundaries. | One codeunit per posting chain per module. |
| Different Field IDs on source and target | Breaks Pattern A migration path; causes data auditing issues. | Always use the same Field ID. |
| Using `OnAfterInsert` on target table instead of posting codeunit event | `OnAfterInsert` fires for all inserts (UI, copy, import) — not only posting. | Use the posting-codeunit-published event. |
| Missing `Editable = false` on posted tables | Users can modify posted data, bypassing posting logic. | Set `Editable = false` on all posted/ledger target fields. |

---

## Before Committing

Run `references/field-segregation-checklist.md` in full before every commit.

Key gates:
1. Same Field ID on source and ALL target TableExts.
2. No redundant subscriber when Pattern A applies.
3. Dedicated subscriber codeunit per posting chain per module.
4. `DataClassification` set on every field.
5. `Editable = false` on all posted/ledger target fields.
6. Test posting confirms field value propagates end-to-end.

---

## Behaviour Rules

1. **Always decide pattern first.** Do not write code until you have opened the posting codeunit and confirmed whether `TransferFields` is called. Pattern selection is irreversible in a clean architecture.
2. **Same Field ID everywhere.** Never generate a target TableExt with a Field ID different from the source. Reject the request and ask for clarification if the user provides inconsistent IDs.
3. **Read the event map before any subscriber.** Always read `references/pattern-b-event-map.md` before writing Pattern B code. Do not guess the event name.
4. **One codeunit per posting chain per module.** Never merge subscribers from different posting chains. Never split one posting chain's subscribers across two codeunits.
5. **Detect and flag redundant subscribers.** If an existing subscriber manually copies a field that `TransferFields` already handles, flag it as an anti-pattern and recommend deletion.
6. **Never use `OnAfterInsert` on target tables** as a substitute for a posting codeunit event. Always prefer the integration event published by the posting codeunit.
7. **Run the checklist.** Always output the checklist path (`references/field-segregation-checklist.md`) at the end of the implementation as a reminder to run it before committing.
