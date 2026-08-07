---
name: bc-report-selection-generator
description: >-
  Extends the Business Central Report Selection framework with new custom
  Usage values and wires them into the standard printing workflow. Creates
  an enumextension on "Report Selection Usage" (global) or on an
  area-specific enum ("Report Selection Usage Sales", "Report Selection
  Usage Purchase", "Report Selection Usage Service"), optionally a
  dedicated Report Selections setup page filtered to the new Usage,
  an initialisation/install/upgrade codeunit that seeds a default
  Report ID without overwriting customer configuration, a Report
  Selection Management codeunit that reads Report Selections in
  Sequence order and calls Report.RunModal / SaveAsPdf, and page or
  page-extension actions that trigger the configured report. Use when
  the user asks to "extend Report Selection Usage", "add a new report
  selection category", "create a custom print action", "add my report
  to the Report Selections page", "hardcode replace Report.RunModal
  with a configured report", "add a Print document action driven by
  Report Selections", or "seed a default report selection on install".
---

# Business Central Report Selection Category Generator

## Overview

Generates all AL objects required to extend the Business Central
**Report Selection** framework with one or more new `Usage` values and
integrate them into the standard printing workflow.

The output follows Microsoft's own patterns used by codeunit
`77 "Report Selections"` and pages such as `Report Selection - Sales`
(9657), `Report Selection - Purchase` (9657), and
`Report Selection - Service` (9657 range). Report IDs are **never
hardcoded** in business logic — they are read from table
`77 "Report Selections"` at runtime.

## Quick Start

**Example requests:**

- "Extend Report Selection Usage with a new value for my Delivery Note"
- "Add a custom Print action to the Statistical Account Card that uses Report Selections"
- "Create a Report Selections setup page for my Statistical Account Statement report"
- "Hook my report into the standard Sales Report Selection page"
- "Seed the default report on install for my new usage value"

## Prerequisites

- Available object IDs from `app.json` → `idRanges`
- Project affix from `app.json` → `affixes`
- The target Report object already exists (or is being generated in
  the same task)
- If a custom **Print** action is required: the target page and the
  source record must be known (or elicited via the interview below)

## Interview — Mandatory Questions

Before generating any code the skill MUST ask the user the following
questions using `vscode_askQuestions`. Do NOT proceed until every
answer is collected. Questions marked *conditional* only fire when the
earlier answer leaves them relevant.

### Question 1 — Target enum

> Which Report Selection Usage enum should the new value(s) extend?

| Option | Underlying enum | When to pick it |
|---|---|---|
| **Global — `Report Selection Usage`** *(default)* | `enum 77 "Report Selection Usage"` | Brand new business process not related to a standard document flow — e.g. a statistical account statement, a plant maintenance work order, a physical inventory tag. |
| **Sales — `Report Selection Usage Sales`** | `enum "Report Selection Usage Sales"` | The new usage is part of the sales document print flow (e.g. an additional layout for shipments). |
| **Purchase — `Report Selection Usage Purchase`** | `enum "Report Selection Usage Purchase"` | Part of the purchase document print flow. |
| **Service — `Report Selection Usage Service`** | `enum "Report Selection Usage Service"` | Part of the service document print flow. |
| **Bank — `Report Selection Usage Bank"`** | `enum "Report Selection Usage Bank"` | Part of the bank document print flow. |

> **Important**: Extending the **global** enum does NOT automatically
> add the value to the Sales / Purchase / Service / Bank Report
> Selections pages. If the user needs the value to appear on one of
> those existing pages, they must extend the corresponding
> area-specific enum, not the global one.

### Question 2 — Setup surface (own page vs existing page)

> Should the new Usage value(s) have their **own** Report Selections
> setup page, or reuse an **existing** Report Selections page?

| Option | Impact |
|---|---|
| **Own setup page** *(recommended for global usage)* | Generate a list page based on `Report Selections` filtered to the new Usage via `SourceTableView` + `FilterGroup(2)`, with `OnNewRecord` setting `Usage`. |
| **Existing page** (Sales / Purchase / Service / Bank) | No new setup page is generated. The user must have picked the matching area-specific enum in Question 1. Confirm with the user that the target page already includes the new enum value (extensible enum tables auto-expand the option list). |
| **Not sure** | The skill defaults to **Own setup page** and warns the user that reusing an existing page requires picking the corresponding area-specific enum. |

### Question 3 — Print action target (conditional)

Fire ONLY if the user has not clearly stated where the new report
should be triggered from. If Question 1 selected an **area-specific**
enum AND the print flow is the standard one, this question can be
skipped because the standard page action already invokes
`Report Selections`.

> Which **page** should host the "Print Document" action, and what
> **source record** should be passed to the report?

Ask both parts explicitly:

- **Page** — Card, List, Document, or both. Ask the exact page name
  (or the entity so the skill can derive the standard page name).
- **Source record** — the record type that will be filtered and
  passed to `Report.RunModal(..., Rec)`. Usually this is the same as
  the page source table, but for header/lines pages the header is
  typical.

If the user is still uncertain, offer the safe default: add the action
to the **Card** page and pass `Rec` (the current header/master
record) as the source.

### Question 4 — Default Report ID seeding

> Should the extension **seed a default Report ID** for the new Usage
> value(s) so the customer has a working setup out of the box?

| Option | Impact |
|---|---|
| **Yes — on install only** *(recommended)* | Generate an install codeunit (`Subtype = Install`) that inserts a `Report Selections` record only when none exists for this Usage. |
| **Yes — on install and on upgrade** | Also generate (or extend) an upgrade codeunit (`Subtype = Upgrade`) guarded by an Upgrade Tag so the default is set for tenants that installed a previous version without it. |
| **No** | Skip install/upgrade seeding. Document in the summary that the customer must configure Report Selections manually. |

> **Rule**: The generated code MUST NOT overwrite an existing
> Report Selections record. Insertion happens only when the filtered
> `Report Selections` recordset is empty for the target `Usage`.

### Question 5 — Number of new Usage values

> How many Usage values should be added to the enum in this task?

Most cases require a single value. If more than one, ask for each
value's name and caption before generating.

## Code Generation Steps

### Step 1 — Read project metadata

1. Read `app.json` to obtain `idRanges`, `affixes`, `name`, `publisher`.
2. Determine the affix (e.g. `BCS`).
3. Allocate object IDs for: EnumExtension, Report Selections
   setup Page (if any), Report Selection Management Codeunit,
   Install Codeunit and Upgrade Codeunit (if seeding), Upgrade Tag
   Definitions Codeunit (if upgrade seeding), PageExtension(s) or
   Page action(s) that host the print action.

### Step 2 — Determine naming

Derive names from the entity / usage name and project affix:

| Artefact | Naming pattern | Example (usage = `Statistical Account Statement`, affix = `BCS`) |
|---|---|---|
| Enum Extension | `<Affix> <Short> Rep. Sel. Usage` | `BCS Stat. Acc. Rep. Sel. Usage` |
| Setup Page (list) | `<Affix> <Short> Report Selection` | `BCS Stat. Acc. Report Selection` |
| Report Sel. Mgmt. CU | `<Affix> <Short> Report Sel. Mgmt.` | `BCS Stat. Acc. Report Sel. Mgmt.` |
| Install CU | `<Affix> <Short> Install` (reuse existing if present) | `BCS Stat. Acc. Install` |
| Upgrade CU | `<Affix> <Short> Upgrade` (reuse existing if present) | `BCS Stat. Acc. Upgrade` |
| Upgrade Tag Def. CU | `<Affix> <Short> Upg. Tag Def.` (reuse existing) | `BCS Stat. Acc. Upg. Tag Def.` |
| Page Extension | `<Affix> <Entity> Card / List` (reuse existing) | `BCS Statistical Account Card` |

### Step 3 — Determine folder structure

Place generated files under the appropriate feature folder,
following the workspace convention already in use:

```
<feature-folder>/
├── Enum Extension/
│   └── <Affix><ShortPascal>RepSelUsage.EnumExt.al
├── Page/                                       (only if own setup page)
│   └── <Affix><ShortPascal>ReportSelection.Page.al
├── Codeunit/
│   ├── <Affix><ShortPascal>ReportSelMgmt.Codeunit.al
│   ├── <Affix><ShortPascal>Install.Codeunit.al       (if seeding)
│   ├── <Affix><ShortPascal>Upgrade.Codeunit.al       (if upgrade seeding)
│   └── <Affix><ShortPascal>UpgTagDef.Codeunit.al     (if upgrade seeding)
└── Page Extension/                             (if a new Print action is added)
    └── <Affix><Entity>Card.PageExt.al
```

Existing install / upgrade / upgrade tag codeunits in the project
MUST be reused instead of duplicated. If they exist, extend them
rather than generate new ones.

### Step 4 — Generate the Enum Extension

Extend the enum chosen in Question 1. Use the project ID range and
allocate one value ID **per new Usage** (numbers must lie inside the
project's `idRanges`).

See: `references/enum-extension-template.md`

> **Rule**: Never renumber and never delete published enum values.
> Values are additive only.

### Step 5 — Generate the Report Selections setup page (conditional)

Only when Question 2 = "Own setup page".

Key patterns (copied from `Report Selection - Sales` in the base app):

- `SourceTable = "Report Selections"`
- `SourceTableView = sorting(Usage, Sequence) where(Usage = const("<new usage>"))`
- `PageType = List` and `UsageCategory = Administration`
- `OnOpenPage` uses `Rec.FilterGroup(2)` to lock the Usage filter so
  users cannot remove it and edit unrelated selections
- `OnNewRecord` pre-fills `Rec.Usage` with the new value
- Show fields: `Sequence`, `Report ID`, `Report Caption` (flowfield),
  `Use for Email Body`, `Use for Email Attachment`, `Email Body Layout
  Description`, `Report Layout` — mirror the standard page columns

See: `references/report-selection-page-template.md`

### Step 6 — Generate the Report Selection Management Codeunit

This codeunit is the **only** place that names the standard table
`77 "Report Selections"` in business code. It exposes at least:

1. `PrintReport(<SourceRecord>: Record ...)` — request page shown
2. `PrintReportModal(<SourceRecord>: Record ...)` — silent
3. Optional `SaveAsPdf(<SourceRecord>: Record ...; var TempBlob: Codeunit "Temp Blob")`

Algorithm:

```
ReportSelection.Reset();
ReportSelection.SetRange(Usage, "Report Selection Usage"::"<new value>");
ReportSelection.SetFilter("Report ID", '<>0');
ReportSelection.SetCurrentKey(Sequence);
if ReportSelection.FindSet() then
    repeat
        Report.RunModal(
            ReportSelection."Report ID", true, false, SourceRec);
    until ReportSelection.Next() = 0
else
    Error(NoReportSelectedErr);
```

Rules:

1. **Never** call `Report.RunModal(Report::"<Hardcoded>", …)` in the
   business action. The codeunit is the only integration point.
2. `SetCurrentKey(Sequence)` is required so multiple configured
   reports run in the configured order.
3. Missing setup MUST raise an error label
   (`NoReportSelectedErr`) — do NOT silently fall back to a
   hardcoded default.
4. Convert the source record to a `RecordRef` if the source table
   must be inferred from `Report Selections."Report ID"` — for
   single-usage codeunits the strongly typed `SourceRec` variant
   above is preferred.

See: `references/report-sel-mgmt-codeunit-template.md`

### Step 7 — Generate the page action (conditional)

Only when Question 3 identified a target page.

- If the target is a **custom** page you own → add the action
  directly to the page.
- If the target is a **standard** page → add the action via a
  `pageextension`.

Action pattern:

```al
action(<Affix>PrintDocument)
{
    ApplicationArea = All;
    Caption = 'Print';
    Image = Print;
    Promoted = true;
    PromotedCategory = Process;
    PromotedIsBig = true;
    ToolTip = 'Print the document using the configured Report Selection.';

    trigger OnAction()
    var
        ReportSelMgmt: Codeunit "<Affix> <Short> Report Sel. Mgmt.";
    begin
        ReportSelMgmt.PrintReport(Rec);
    end;
}
```

Rules:

1. The action ONLY delegates to the management codeunit — never
   inline `Report.RunModal`.
2. The source record passed is exactly what was elicited in
   Question 3.
3. Reuse an existing PageExtension in the target folder if one
   already exists — do NOT create a second PageExtension against
   the same base page.

See: `references/page-action-template.md`

### Step 8 — Generate Install / Upgrade seeding (conditional)

Only when Question 4 = Yes.

**Install codeunit** (`Subtype = Install`):

- Trigger `OnInstallAppPerCompany`
- Detect first install via `NavApp.GetCurrentModuleInfo` +
  `Version.Create(0,0,0,0)`
- Call `InsertDefaultReportSelection` only on first install
- The helper checks `SetRange(Usage, ...)` + `IsEmpty()` before
  inserting to avoid overwriting customer configuration

**Upgrade codeunit** (`Subtype = Upgrade`) — only if Question 4 =
"install and upgrade":

- Trigger `OnUpgradePerCompany`
- Guard with `UpgradeTag.HasUpgradeTag(UpgradeTagDef.GetSeedTag())`
- After running seeding call `UpgradeTag.SetUpgradeTag(...)`
- Register the tag for new companies via
  `OnGetPerCompanyUpgradeTags`

Both codeunits call a shared helper:

```al
local procedure InsertDefaultReportSelection()
var
    ReportSelection: Record "Report Selections";
begin
    ReportSelection.SetRange(
        Usage, "Report Selection Usage"::"<new value>");
    if not ReportSelection.IsEmpty() then
        exit;

    ReportSelection.Init();
    ReportSelection.Usage :=
        "Report Selection Usage"::"<new value>";
    ReportSelection.Sequence := '1';
    ReportSelection.Validate(
        "Report ID", Report::"<Default Report>");
    ReportSelection.Insert(true);
end;
```

Rules:

1. Insert only when the filtered recordset is empty.
2. Use `Validate` on `"Report ID"` to trigger BC's own report-object
   validation.
3. `Sequence` must be a `Code[10]`, not an integer — use `'1'`.
4. Upgrade seeding MUST be tag-guarded (`HasUpgradeTag` / `SetUpgradeTag`).

See: `references/install-codeunit-template.md`,
`references/upgrade-codeunit-template.md`,
`references/upgrade-tag-def-template.md`

### Step 9 — Summary and next steps

After generating all files, present a summary:

```
Report Selection Category Generated for: [Usage caption]

Objects created / modified:
- EnumExtension [ID] "[Name]" — [file path]
- Page [ID] "[Name]" — [file path]                (if own setup page)
- Codeunit [ID] "[Name] Report Sel. Mgmt." — [file path]
- Codeunit [ID] "[Name] Install" — [file path]    (if seeding)
- Codeunit [ID] "[Name] Upgrade" — [file path]    (if upgrade seeding)
- Codeunit [ID] "[Name] Upg. Tag Def." — [file path]
- PageExtension [ID] "[Name] Card" — [file path]  (if print action)

Post-publish setup:
1. Publish the extension.
2. Navigate to the new "[Setup page]" (or the existing area page).
3. Verify the default Report ID (if seeded) or set one manually.
4. Test the "Print" action on [target page] with a sample record.
```

## Base-application patterns to follow (verified)

The generated code must mirror these patterns present in the base
application. Cite them in comments when appropriate.

| Base object | Pattern reused |
|---|---|
| Table `77 "Report Selections"` | Key `(Usage, Sequence)`, `Report ID` field validated against `AllObj` |
| Codeunit `77 "Report Selections"` | Named procedures per usage (e.g. `GetPdfReportForCust`), `SetRange(Usage, …)` + `FindSet` + `repeat`-`RunModal` idiom |
| Page `9657 "Report Selection - Sales"` | `FilterGroup(2)` lock, `OnNewRecord` sets `Usage`, `SourceTableView where(Usage = const(…))` |
| Enum `"Report Selection Usage"` | Extensible = true, additive-only values, captions without commas |
| Standard install/upgrade for report selections | Insert only when filtered set is empty; upgrade-tag guarded |

## Rules

1. Always use the project **affix** for all object and field names.
2. Enum values must be **additive**. Never renumber or delete a
   published value. Obsolete instead.
3. Enum captions must NOT contain commas (AppSourceCop AS0087).
4. Business logic MUST NOT hardcode `Report::"…"`. All report
   invocations must come from `Report Selections`.
5. Reading `Report Selections` must always apply
   `SetCurrentKey(Sequence)` and iterate with `FindSet` + `repeat`.
6. When no report is configured, raise a descriptive error — never
   fall back to a hidden default.
7. Install/Upgrade seeding may **only** insert when the filtered
   recordset for the target `Usage` is empty.
8. Upgrade seeding must be guarded by an Upgrade Tag registered via
   `OnGetPerCompanyUpgradeTags` (or `OnGetPerDatabaseUpgradeTags`).
9. Extending the **global** enum does not add the value to the
   Sales / Purchase / Service / Bank Report Selections pages — pick
   the area-specific enum when standard integration is required.
10. Setup pages filtered by Usage MUST use `FilterGroup(2)` +
    `OnNewRecord` so users cannot accidentally edit unrelated
    Report Selections.
11. Print actions must delegate to the Report Selection Management
    codeunit — never call `Report.RunModal` directly from the
    trigger.
12. Follow the instruction files under `.github/instructions/` for
    naming, code style, and performance.

## Anti-patterns to reject

Reject and rewrite any code the user proposes that matches these:

- `Report.RunModal(Report::"My Report", true, false, Rec);` in a
  page action (bypasses Report Selections entirely).
- Deleting or renumbering an already-published enum value.
- Overwriting `Report Selections` on install or upgrade
  (`Modify(true)` / unconditional `Insert`).
- Setup pages on `Report Selections` without `FilterGroup(2)` — the
  user can remove the filter and corrupt unrelated categories.
- Silent fallback to a hardcoded Report ID when the setup is empty.
- Extending the global enum expecting the value to appear on the
  standard area Report Selections page.
