---
name: bc-table-dimensions-generator
description: Adds Business Central standard dimension support to custom tables and their pages, following the DimensionManagement patterns used by Sales Header/Line, Job Journal Line and the repository Incident, Penalty and Work Worksheet modules. Generates Shortcut Dimension 1/2 Code fields (CaptionClass 1,2,N), the Dimension Set ID field, ValidateShortcutDimCode, ShowDimensions and ShowShortcutDimCode procedures, a card-page Dimensions group with all 8 shortcut dimensions whose visibility follows General Ledger Setup via DimMgt.UseShortcutDims, a Dimensions action, list-page global dimension columns, and default-dimension inheritance from master data (Resource, Customer, Vendor, Item, Job, Location, Employee) through CreateDimFromDefaultDim/GetRecDefaultDimID or a centralized GetDefaultDimID source-resolution procedure. Also covers header-to-line dimension inheritance and cascading. Use when adding dimensions to a custom table, making a custom document dimension-aware, showing shortcut dimensions on a page, controlling dimension visibility, or inheriting default dimensions from resources, customers or other master data.
---

# BC Table Dimensions Generator

Implements full dimension support on a custom table: fields, validation, page UI with visibility control, and default-dimension inheritance from master data.

Code templates: [references/code-templates.md](references/code-templates.md)

## Repository reference implementations

Read these before generating; mirror their style.

| Concern | File |
|---|---|
| Fields + procedures (lean) | `src/incident/tables/PTEIncidentHeader.Table.al` |
| Centralized inheritance with fallback | `src/incident/codeunits/PTEIncidentMgt.Codeunit.al` → `ApplyDefaultDimensions`, `GetDimensionSourceResourceNo` |
| Card Dimensions group + visibility | `src/incident/pages/PTEIncidentCard.Page.al` → `SetDimensionsVisibility` |
| Standard per-field inheritance | `src/penalty/tables/PTEPenaltyHeader.Table.al` → `CreateDimFromDefaultDim`, `CreateDim`, `GetTableValuePair`, `InitDefaultDimensionSources` |
| Header → line inheritance + cascade | `src/webfleet/tables/PTEWorkWorksheetLine.Table.al` (OnInsert), `src/webfleet/codeunits/PTEWorkWorksheetMgt.Codeunit.al` → `CascadeDimensionsToLines` |
| Archive / API exposure | `src/penalty/tables/PTEPenaltyHeaderArchive.Table.al`, `src/penalty/pages/PTEPenaltiesAPI.Page.al` |

## Workflow

### Step 1 — Gather inputs

Ask the user (group into one question round):

1. Target table (name, ID, primary key field) and its card page / list page.
2. **Master data fields** that must provide default dimensions, e.g. `"Customer No."` → `Database::Customer`, `"Vehicle Resource No."` → `Database::Resource`.
3. **Inheritance strategy** (see Step 4): Standard merge (A) or Single source with fallback (B). If B, the ordered fallback list.
4. Source code for Default Dimension Priorities (`SourceCodeSetup.Sales`, `.Purchases`, `.General`, …). Default: `SourceCodeSetup.Sales` (repo convention).
5. Whether the table has lines that must inherit/cascade header dimensions.

Then verify field IDs 400, 401, 480 are free in the table (repo convention, aligned with standard documents). If taken, propose free IDs.

### Step 2 — Table fields

Add `"Shortcut Dimension 1 Code"` (400), `"Shortcut Dimension 2 Code"` (401), `"Dimension Set ID"` (480). Template §1.

Rules:
- `CaptionClass = '1,2,1'` / `'1,2,2'` so captions follow the actual global dimension names.
- `TableRelation` filtered by `"Global Dimension No."` and `Blocked = const(false)`.
- Shortcut dimensions 3–8 are **never** stored as fields; they live only in the dimension set.
- `"Dimension Set ID"` is `Editable = false`; `OnLookup` calls `ShowDimensions()`; `OnValidate` (optional, used by Penalty) calls `UpdateGlobalDimFromDimSetID` so API/import writes keep globals in sync.

### Step 3 — Table procedures

Always add (template §2): `ValidateShortcutDimCode`, `ShowShortcutDimCode`, `ShowDimensions`. Declare `DimMgt: Codeunit DimensionManagement` as a global `var`.

### Step 4 — Default dimension inheritance from master data

Choose with the user:

| Strategy | Behaviour | Use when |
|---|---|---|
| **A. Standard merge** (Penalty / Sales Line) | Every master-data field triggers `CreateDimFromDefaultDim(FieldNo(...))`. All sources are merged by `GetRecDefaultDimID`; conflicts resolved by **Default Dimension Priorities** for the source code. | Several sources contribute different dimensions (Customer → AREA, Resource → VEHICLE). |
| **B. Single source with fallback** (Incident) | One procedure resolves exactly one source (e.g. Vehicle, else Driver) and calls `GetDefaultDimID`. | Business rule says "one source wins" regardless of priorities. |

Strategy A (template §3):
- `OnValidate` of each master field → `CreateDimFromDefaultDim(Rec.FieldNo("<Field>"))`.
- `InitDefaultDimensionSources`: one `DimMgt.AddDimSource(DefaultDimSource, Database::<Table>, Rec."<Field>", FieldNo = Rec.FieldNo("<Field>"))` per master field — **all** sources every time, so dimensions from untouched fields are kept.
- `GetTableValuePair`: one `case` branch per master field.
- `CreateDim`: clear globals, `GetRecDefaultDimID(...)`, `UpdateGlobalDimFromDimSetID(...)`.
- Optionally call `CreateDimFromDefaultDim` from `OnInsert` if master fields can be set before insert without validation.

Strategy B (template §4):
- Put `ApplyDefaultDimensions(var Rec)` + `Get<X>DimensionSource(Rec)` in the module Mgt codeunit.
- Call it from the `OnValidate` of every field participating in the fallback chain (also the lower-priority ones, so clearing the primary falls back correctly).

Both strategies **replace** manually entered dimensions when the master field changes — same as standard BC. State this to the user.

Add an `OnValidate` that refreshes name fields **before** calling the dimension logic, and when master fields are set from code (imports, APIs, workers) use `Validate()` so inheritance fires.

### Step 5 — Card page

Template §5. Add:
- `group(Dimensions)` with `"Shortcut Dimension 1 Code"`, `"Shortcut Dimension 2 Code"`, `ShortcutDimCode[3..8]` (page-variable fields with `CaptionClass = '1,2,N'`, `TableRelation` on Global Dimension No. N, `OnValidate` → `Rec.ValidateShortcutDimCode(N, ShortcutDimCode[N])`) and a hidden `"Dimension Set ID"`.
- Each field `ApplicationArea = Dimensions; Visible = DimVisibleN;`.
- Action `Dimensions` (`Image = Dimensions`, `ShortCutKey = 'Alt+D'`) → `Rec.ShowDimensions(); CurrPage.SaveRecord(); Rec.ShowShortcutDimCode(ShortcutDimCode);`.
- `OnOpenPage` → `SetDimensionsVisibility()`; `OnAfterGetRecord` → `Rec.ShowShortcutDimCode(ShortcutDimCode)`; `OnNewRecord` → `Clear(ShortcutDimCode)`.
- `SetDimensionsVisibility`: reset all `DimVisible1..8` to false, then `DimMgt.UseShortcutDims(DimVisible1, ..., DimVisible8)`. This hides any shortcut slot that is not configured in General Ledger Setup (Global Dimension 1/2 Code, Shortcut Dimension 3..8 Code).
- If the master field `OnValidate` changes dimensions, also refresh the array in the page field `OnAfterValidate` (`Rec.ShowShortcutDimCode(ShortcutDimCode)`) or call `CurrPage.Update()` so slots 3–8 refresh immediately.

### Step 6 — List page (optional)

Template §6. Add `"Shortcut Dimension 1 Code"` / `"Shortcut Dimension 2 Code"` columns with `Visible = false` (user personalizes). For visibility identical to the card, reuse `DimVisible1/2` + `SetDimensionsVisibility`.

### Step 7 — Lines, archives and APIs (when applicable)

- **Lines** (template §7): line `OnInsert` copies header `"Dimension Set ID"` + globals when the line set is 0. Header `ValidateShortcutDimCode` / `ShowDimensions` call `CascadeDimensionsToLines`. For lines with their own master data, combine with `InheritFromDimSetID = Header."Dimension Set ID"` and `InheritFromTableNo = Database::<Header>` in `GetRecDefaultDimID`.
- **Archives / posted tables**: same field IDs 400/401/480 so `TransferFields` copies them; no validation triggers, `ShowDimensions` uses `DimMgt.ShowDimensionSet` (read-only).
- **API pages**: expose `dimensionSetId`, `shortcutDimension1Code`, `shortcutDimension2Code`; keep `dimensionSetId` read-only.

### Step 8 — Validate

- Build and fix diagnostics.
- Translations: add XLF entries for new captions/tooltips if the repo translation workflow requires it.
- Tests (repo-native, under `test/<module>/`): see checklist below.

## Gotchas

- Forgetting `UpdateGlobalDimFromDimSetID` after any Dimension Set ID change → globals out of sync with the set.
- Shortcut 3–8 page fields are plain page variables: if `OnAfterGetRecord` does not call `ShowShortcutDimCode`, they show stale values when navigating records.
- `GetRecDefaultDimID` needs a `Source Code Setup` record — use `Get()` (strategy A) or `if SourceCodeSetup.Get()` (strategy B, test-friendly).
- Do not assign master data fields directly in code when dimensions must follow; use `Validate`.
- In strategy A, always add **every** master source in `InitDefaultDimensionSources`; adding only the changed field drops dimensions coming from the other fields.

## Testing checklist

1. Validating a master-data field with Default Dimensions fills `"Dimension Set ID"` and globals.
2. Strategy A: two sources with conflicting dimension resolved by Default Dimension Priority.
3. Strategy B: primary blank → fallback source used; both blank → set cleared.
4. Editing Shortcut Dimension 3..8 on the card updates `"Dimension Set ID"`.
5. `ShowDimensions` change updates Shortcut 1/2 fields.
6. Card shows only shortcut slots configured in General Ledger Setup.
7. Lines inherit header set on insert; header change cascades.
8. Archive keeps the same `"Dimension Set ID"`.
