---
name: bc-reports
description: Standards and guardrails for authoring Business Central reports in AL and RDLC. Use when creating or modifying Report objects (.Report.al), RDLC layouts (.rdlc/.rdl), or request pages. Covers AL report structure, DataItem hierarchy, RDLC layout sizing, SetData/GetData index management, body width validation, and rendering best practices.
---

# Business Central Reports — Authoring Standards

Enforces correct and maintainable patterns when working with BC Report objects and their RDLC layouts.

## Scope

**In scope**: AL `report` object structure, RDLC layout authoring, SetData/GetData index management, page size and body width validation, report rendering modes, BLOB image handling.

**Out of scope**: Report Extensions, Word/Excel layout authoring details, Telemetry/AppInsights instrumentation.

---

## Input

The agent needs from the user:

- **Action**: Create new report, or modify an existing one?
- **Source table(s)**: Which tables provide data (header/lines structure?)
- **Rendering target**: RDLC (default for documents), Word, or Excel
- **Paper format**: A4 Portrait (default), A4 Landscape, Letter
- **Fields to add/modify**: What columns/data items?
- **RDLC section affected** (for modifications): PageHeader, PageFooter, Body, or SetData group?

If the user does not specify, default to: new RDLC report, A4 Portrait, header-lines pattern.

---

## Quick Start — Minimal Report Object

```al
report 50100 "My Report"
{
    UsageCategory = ReportsAndAnalysis;
    ApplicationArea = All;
    DefaultRenderingLayout = RDLCLayout;

    dataset
    {
        dataitem(Header; "Sales Header")
        {
            column(DocumentNo; "No.") { }

            dataitem(Lines; "Sales Line")
            {
                DataItemLink = "Document No." = field("No.");
                DataItemTableView = sorting("Document No.", "Line No.");

                column(LineNo; "Line No.") { }
                column(Quantity; Quantity) { }
            }
        }
    }

    requestpage
    {
        SaveValues = true;
        layout
        {
            area(content)
            {
                group(Options)
                {
                    Caption = 'Options';
                    field(ShowDetails; ShowDetails)
                    {
                        ApplicationArea = All;
                        Caption = 'Show Details';
                        ToolTip = 'Specifies whether detail lines are printed.';
                    }
                }
            }
        }
        var
            ShowDetails: Boolean;
    }

    rendering
    {
        layout(RDLCLayout)
        {
            Type = RDLC;
            LayoutFile = 'src/reports/layouts/MyReport.rdlc';
        }
    }
}
```

---

## Workflow — Creating or Modifying a Report

**When creating a new report**, follow this sequence:
1. Write the AL object (Rules 1 and 5 below).
2. Build or modify the RDLC layout.
3. If adding/removing PageHeader or PageFooter fields → apply Rule 2. **Read `references/rdlc-sizing-reference.md` NOW** for the calculation.
4. If adding SetData fields → apply Rule 3. **Read `references/setdata-index-guide.md` NOW** — do not skip this.
5. If adding Tablix columns → apply Rule 4.
6. Before committing → **read and run `references/al-report-checklist.md`** — do not commit without passing all items.

**When modifying an existing report**, start at step 3, 4, or 5 depending on what changed, then always run step 6.

---

## Rule 1 — AL Report Object Structure

- Always declare `UsageCategory` and `ApplicationArea` on the object.
- Child DataItems **must** have explicit `DataItemLink` and `DataItemTableView` with `sorting(...)`.
- Always declare a `rendering` block with a named layout identifier.
- Layout files live under `src/reports/layouts/`.
- Request page: always `SaveValues = true`. Every field must have `ApplicationArea`, `Caption`, and `ToolTip`.

### Trigger reference

| Trigger | Purpose |
|---------|---------|
| `OnPreReport` | Validate filters, initialize globals |
| `OnPostReport` | Cleanup, final messages |
| `OnAfterGetRecord` | Per-record logic; skip with `CurrReport.Skip()` |
| `OnPreDataItem` | Set additional filters on the DataItem |

---

## Rule 2 — RDLC PageHeader / PageFooter Height Sizing

When adding or removing fields in `PageHeader` or `PageFooter`, **always recalculate and update `<Height>`**.

```
New Height = Last field Top + Field Height + Bottom margin (≥ 0.167 cm)
Standard row spacing: 0.39 cm between rows | Standard row height: 11 pt ≈ 0.388 cm
```

❌ Never leave the old `<Height>` after adding a field — the new row will be clipped silently.

Read `references/rdlc-sizing-reference.md` for unit conversion tables, a worked calculation example, and the page width reference table.

---

## Rule 3 — SetData Field Order: Always Append at End

**CRITICAL — silent data corruption risk.** RDLC uses `Code.GetData(Index, Group)` with **1-based sequential indices**. Inserting a new field anywhere except the end shifts all subsequent indices, causing every downstream textbox to display the wrong field — no compile error, no runtime warning.

✅ **Always append new fields at the end** of the SetData expression.  
❌ **Never insert in the middle.**

After appending, maintain an XML comment index map inside the RDLC:

```xml
<!--
  SetData Group 2 — Field Index Map
  1:  CustomerName
  2:  DocumentDate
  3:  NewFieldLabel    (added 2026-04-30)
  4:  NewFieldValue    (added 2026-04-30)
-->
```

Read `references/setdata-index-guide.md` for the full step-by-step process, counting instructions, and textbox wiring examples.

---

## Rule 4 — Body Width Validation

When adding Tablix columns, verify:
```
Body Width ≤ Page Width − Left Margin − Right Margin
```

Always read `<LeftMargin>` and `<RightMargin>` from the actual RDLC file before calculating — do not use default values.

If the body exceeds the limit, emit this warning and reduce column widths proportionally:
```
⚠️ WARNING: RDLC Body Width Exceeds Available Page Width
Available: {X} cm | Current Body: {Y} cm | Overflow: {Z} cm
Apply reduction factor = Available / Current to all TablixColumn widths.
```

Read `references/rdlc-sizing-reference.md` for the page width reference table and a proportional reduction worked example.

---

## Rule 5 — Rendering Mode

| Rendering type | When to use | Known limitations |
|----------------|-------------|-------------------|
| `RDLC` | Pixel-precise layouts, banding, complex headers/footers | See Rules 2–4 |
| `Word` | Simple documents, mail-merge style | No conditional formatting, no carry-overs between pages, totals cannot be retrieved from last record — avoid for complex documents |
| `Excel` | Data exports for analysis | No complex formatting |

Default to **RDLC** for operational documents (invoices, orders, statements).  
Default to **Excel** for data exports.

---

## Rule 6 — BLOB Image Rendering

When displaying a company logo or any image stored as a BLOB field:

- Always call `CalcFields` on the BLOB field **inside `OnAfterGetRecord`** of the DataItem that owns it — not in `OnPreReport`.
- Add the image column to the dataset with `IncludeCaption = false`.
- In the RDLC, set the image source to `=Fields!LogoField.Value` and `MIMEType = "image/png"` (or jpeg).

**❌ Logo appears on page 1 only or shows as red X on subsequent pages**: the BLOB is not recalculated per record. Move `CalcFields` into `OnAfterGetRecord`.

```al
dataitem(CompanyInfo; "Company Information")
{
    DataItemTableView = sorting("Primary Key");

    trigger OnAfterGetRecord()
    begin
        CalcFields(Picture);  // ✅ must be here, not in OnPreReport
    end;

    column(CompanyPicture; Picture) { IncludeCaption = false; }
}
```

---

## Rule 7 — Preview vs. Print Layout Consistency

The most common RDLC complaint: report looks correct in Preview but differs when printed or switched to Print Layout mode.

**Root causes and fixes:**

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Totals shift or repeat on every page | Wrong group scope for aggregate expression | Move expression into the correct Tablix group row; check `Scope` parameter of `Sum()` / `Last()` |
| Variable shows last value on all pages instead of per-page value | Using `Last()` at report level instead of group level | Scope the aggregate to the page group, or use a running value reset per page |
| Logo / image shows as red X when printing | BLOB not re-fetched after page break | See Rule 6 — `CalcFields` in `OnAfterGetRecord` |
| Controls misaligned in Print Layout | `Top` / `Left` values do not account for section height | Recalculate positions after every section height change (Rule 2) |

**Always test in Print Layout mode**, not only in Preview, before marking a report done.

---

## Known Limitations

### TotalPages with multiple documents (`Page X of Y`)

When printing multiple documents in one batch, `Globals!TotalPages` counts the total pages of **all documents combined**, not per document. There is no native fix in RDLC. Workarounds:

- Use a custom VB.NET function in the code block to track page count resets per document group.
- Accept the limitation and remove `TotalPages` for batch prints.

### Job Queue date errors

A report that runs correctly when launched manually may fail with `"The date is not valid"` when executed from the Job Queue. Cause: SQL `datetime` columns contain a time component that BC's `Date` type rejects.

Fix: cast the field explicitly in AL before passing to the report:

```al
column(PostingDate; DT2Date(Rec."Posting Date")) { }  // if stored as DateTime
```

Or filter out invalid dates in `OnPreDataItem`:

```al
trigger OnPreDataItem()
begin
    SetFilter("Posting Date", '>%1', 0D);
end;
```

### Generic render error ("An error occurred while trying to display the report")

BC does not surface RDLC compile errors explicitly. Diagnostic approach:

1. Remove recently added controls one by one and re-preview after each removal.
2. Check for mismatched `GetData` indices (see Rule 3) — wrong index returns a type mismatch at render time.
3. Validate that all dataset column names referenced in the RDLC still exist in the AL report object.
4. Check for empty `<Value>` expressions or expressions referencing a deleted field.

---

## Before Committing

Run `references/al-report-checklist.md` — covers both the AL object layer and the RDLC layout layer.

---

## Behaviour Rules

1. **Never modify an RDLC SetData expression without counting the existing indices first.** If you cannot confirm the current field count, read the existing RDLC file before making changes.

2. **Never add a field to PageHeader/PageFooter without recalculating `<Height>`.** Present the calculation to the user: `Last Top + Height + margin = New Height`.

3. **Always verify Body Width after adding any Tablix column.** Emit the overflow warning if exceeded — do not silently leave an oversized layout.

4. **If the user reports "report looks wrong when printed"**, apply the Rule 7 diagnostic table before proposing code changes. Ask which symptom matches.

5. **Default to RDLC for any operational document.** Only suggest Word/Excel if the user explicitly asks or the use case is a simple data export.

6. **When modifying an existing report, preserve all existing SetData indices.** New fields go at the end — this is non-negotiable.

7. **Always recommend testing in Print Layout mode**, not just Preview. Mention this when delivering a report modification.

8. **If the user asks for `Page X of Y` in a multi-document batch**, warn about the known limitation immediately — before writing any code.
