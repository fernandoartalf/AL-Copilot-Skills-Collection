---
name: bc-approval-workflow-generator
description: >-
  Automatically generate custom approval workflow implementations for Business
  Central entities following the standard Workflow engine pattern. Creates an
  Approval Status enum, table extension (or table field), approval management
  codeunit with integration events and event subscribers, workflow setup codeunit
  with category/template registration, and page extension actions (Send / Cancel).
  Use when user requests to create, generate, or build an approval workflow,
  add approvals to a table, implement send/cancel approval actions, or mentions
  custom workflow for a Business Central entity. Trigger phrases include "create
  approval workflow", "add approvals to [entity]", "generate workflow for [table]",
  "implement approval process", "send approval request for [entity]", or when
  implementing custom approval processes on standard or custom tables.
---

# Business Central Approval Workflow Generator

## Overview

Generates all AL objects required to integrate a Business Central entity
(standard or custom table) into the built-in Workflow approval engine.
The generated code follows the pattern used by standard BC approvals
(Purchase Orders, Sales Orders) and subscribes to the same event hooks.

## Quick Start

**Example requests:**

- "Create an approval workflow for Statistical Account"
- "Add approval process to my custom Job Request table"
- "Generate send/cancel approval actions for the Transfer Order card"
- "Implement approval workflow on the Vendor Card"

## Prerequisites

- Available object IDs from `app.json` → `idRanges`
- Project affix from `app.json` → `affixes`
- The target table must already exist (standard or custom)
- Knowledge of which page(s) display the entity (Card and/or List)

## Interview — Mandatory Questions

Before generating any code the skill MUST ask the user the following
questions using `vscode_askQuestions`. Do NOT proceed until every answer
is collected.

### Question 1 — Target entity

> Which table should have the approval workflow?

If the user already mentioned the entity, confirm it. Otherwise present
a free-text input. Validate the table exists in the workspace or is a
known standard BC table.

### Question 2 — Table type

> Is this a custom table you own, or a standard BC table that you will
> extend via table extension?

| Option | Impact |
|---|---|
| **Custom table** | Field added directly; `OnDelete` trigger in table |
| **Standard table (extension)** | Field added via `tableextension`; `OnBeforeDelete` trigger |

### Question 3 — Related sub-tables (lock-down)

> Does this entity have related sub-tables (e.g. lines on a document)
> that should be locked (Editable = false) when the approval status is
> not Open?

If **Yes**, ask for the sub-table name(s) and the page part(s) that
display them. The generator will add `Editable` property binding on
those subpage parts.

### Question 4 — Pages

> Which pages should receive the Send / Cancel Approval Request actions?

Present options:

- Card page only
- List page only
- Both Card and List (default / recommended)

Ask for the exact page names if not obvious from the entity name.

### Question 5 — Approver routing

> Which approver routing should the workflow template default to?

| Option | Description |
|---|---|
| **Direct Approver** | Routes to the user's direct approver in Approval User Setup (default) |
| **First Qualified Approver** | Routes to the first user with sufficient approval limit |
| **Approver Chain** | Routes through the full approval hierarchy |
| **Specific User** | Always routes to a fixed user |

## Code Generation Steps

### Step 1 — Read project metadata

1. Read `app.json` to obtain `idRanges`, `affixes`, `name`, `publisher`.
2. Determine the affix (e.g. `BCS`).
3. Allocate object IDs for: Enum, Codeunit (Approval Mgmt.), Codeunit
   (Workflow Setup), and optionally Table Extension / Page Extensions.

### Step 2 — Determine naming

Derive names from the entity name and project affix:

| Artefact | Naming pattern | Example (entity = `Statistical Account`, affix = `BCS`) |
|---|---|---|
| Enum | `<Affix> <Short> Appr. Status` | `BCS Stat. Acc. Appr. Status` |
| Table Extension | `<Affix> <Entity>` | `BCS Statistical Account` |
| Approval Mgmt. CU | `<Affix> <Short> Approval Mgmt.` | `BCS Stat. Acc. Approval Mgmt.` |
| Workflow Setup CU | `<Affix> <Short> Workflow Setup` | `BCS Stat. Acc. Workflow Setup` |
| Page Extension (Card) | `<Affix> <Entity> Card` | `BCS Statistical Account Card` |
| Page Extension (List) | `<Affix> <Entity> List` | `BCS Statistical Account List` |

### Step 3 — Determine folder structure

Place generated files under the appropriate feature folder:

**Custom table (you own the table and page objects):**

```
<feature-folder>/
├── Enum/
│   └── <Affix><ShortPascal>ApprStatus.Enum.al
├── Table/
│   └── <Affix><Entity>.Table.al        (add field + OnDelete)
├── Page/
│   ├── <Affix><Entity>Card.Page.al     (add actions + triggers)
│   └── <Affix><Entity>List.Page.al
└── Codeunit/
    ├── <Affix><ShortPascal>ApprovalMgmt.Codeunit.al
    └── <Affix><ShortPascal>WorkflowSetup.Codeunit.al
```

**Standard table (extend via tableextension / pageextension):**

```
<feature-folder>/
├── Enum/
│   └── <Affix><ShortPascal>ApprStatus.Enum.al
├── Table Extension/
│   └── <Affix><Entity>.TableExt.al
├── Page Extension/
│   ├── <Affix><Entity>Card.PageExt.al
│   └── <Affix><Entity>List.PageExt.al
└── Codeunit/
    ├── <Affix><ShortPascal>ApprovalMgmt.Codeunit.al
    └── <Affix><ShortPascal>WorkflowSetup.Codeunit.al
```

### Step 4 — Generate the Approval Status Enum

Create an enum with four values: `Open`, `Pending Approval`, `Rejected`,
`Approved`. Mark as `Extensible = true`.

See: `references/enum-template.md`

### Step 5 — Generate the Table / Table Extension

Add a field of the enum type with:
- `Editable = false`
- `DataClassification = CustomerContent`

Deletion guard logic:
1. Blocks deletion if status is Approved or Pending Approval.
2. Calls `ApprovalsMgmt.DeleteApprovalEntries(Rec.RecordId)`.

Editability helper:
- Add an `ApprovalStatusAllowModify(): Boolean` procedure that returns
  `false` when status is Approved or Pending Approval, `true` otherwise.
  Pages use this to bind `Editable` on layout groups.

| Table type | Trigger | Template |
|---|---|---|
| **Custom table** | `OnDelete` directly in the table | `references/custom-table-template.md` |
| **Standard table** | `OnBeforeDelete` in a `tableextension` | `references/table-extension-template.md` |

### Step 6 — Generate the Approval Management Codeunit

This is the **core** object. It contains:

1. **Integration event publishers** — `OnSend…ForApproval`, `OnCancel…ApprovalRequest`
2. **Validation** — `Check…ApprovalPossible`, `Is…ApprovalWorkflowEnabled`
3. **Event code identifiers** — `Run…Code(): Code[128]`
4. **Event subscribers for workflow events** — handle `HandleEvent` calls
5. **Event subscribers for the workflow library** — register events and predecessors
6. **Event subscribers for approval entry** — populate entry arguments
7. **Event subscribers for status updates** — pending, approve, reject
8. **Event subscribers for response handling** — release, open, response predecessors
9. **Card page mapping** — `OnConditionalCardPageIDNotFound`
10. **Set status to Open helper** — `Set{Entity}StatusToOpen` procedure
    called from the Cancel action on pages to revert status

See: `references/approval-mgmt-codeunit-template.md`

### Step 7 — Generate the Workflow Setup Codeunit

Subscribes to `Workflow Setup` events to register:

1. A **workflow category** (short code + description)
2. **Table relations** linking the entity to `Approval Entry` AND
   `Workflow Webhook Entry` (for Power Automate integration)
3. A **workflow template** with pre-configured steps
4. **UpdateMatrixData** — inserts `WF Event/Response Combination`
   records so the workflow editor shows all response options
   (Send Approval Request, Set Status to Pending Approval,
   Send Notification to Webhook, Cancel All Approval Requests)
   for the custom events. Without this, responses are missing
   from the workflow step configuration UI.

See: `references/workflow-setup-codeunit-template.md`

### Step 8 — Generate Page / Page Extension(s)

For each target page (Card / List), add:

1. The `Approval Status` field in layout (with `StyleExpr`)
2. An **Approval** action group with Send / Cancel actions
3. `OnAfterGetRecord` trigger logic for button enablement and page
   editability via `Rec.ApprovalStatusAllowModify()` (custom table)
   or `Rec.{Affix}ApprovalStatusAllowModify()` (table extension)
4. `modify(General) { Editable = GPageEditable; }` to lock the
   General group when status is not Open — do NOT use
   `CurrPage.Editable` as it prevents approval action buttons
   from being clickable
5. Cancel action calls `ApprovalMgmt.Set{Entity}StatusToOpen(Rec)`
   to explicitly revert status
6. If sub-tables are locked: `Editable` binding on subpage parts

| Page type | Template |
|---|---|
| **Custom page** (you own the page object) | `references/custom-page-card-template.md` |
| **Standard page** (extend via pageextension) | `references/page-extension-card-template.md` |

### Step 9 — Summary and next steps

After generating all files, present a summary:

```
Approval Workflow Generated for: [Entity Name]

Objects created:
- Enum [ID] "[Name]" — [file path]
- Table Extension [ID] "[Name]" — [file path]  (if applicable)
- Codeunit [ID] "[Name]" — [file path]
- Codeunit [ID] "[Name]" — [file path]
- Page Extension [ID] "[Name]" — [file path]
- Page Extension [ID] "[Name]" — [file path]

Post-publish setup:
1. Publish the extension
2. Navigate to Workflows → create workflow from template
3. Configure Approval User Setup
4. Enable the workflow
5. Test: Send → Approve / Reject / Delegate / Cancel
```

## Event Subscriber Reference

The approval management codeunit must subscribe to these standard events:

| Standard Codeunit | Event | Purpose |
|---|---|---|
| `Workflow Event Handling` | `OnAddWorkflowEventsToLibrary` | Register send & cancel events |
| `Workflow Event Handling` | `OnAddWorkflowEventPredecessorsToLibrary` | Chain events |
| `Approvals Mgmt.` | `OnPopulateApprovalEntryArgument` | Fill Document No. / Table ID |
| `Approvals Mgmt.` | `OnSetStatusToPendingApproval` | Status → Pending |
| `Approvals Mgmt.` | `OnApproveApprovalRequest` | Status → Approved |
| `Approvals Mgmt.` | `OnRejectApprovalRequest` | Status → Rejected |
| `Approvals Mgmt.` | `OnBeforeShowCommonApprovalStatus` | Display message |

> **CRITICAL**: The `OnBeforeShowCommonApprovalStatus` event parameter
> is named `IsHandle` (NOT `IsHandled`). Using the wrong name causes
> the subscriber to silently fail to bind.

> **CRITICAL**: Use `HasOpenOrPendingApprovalEntries` in
> `OnApproveApprovalRequest` (NOT `HasOpenPendingApprovalEntries`
> which does not exist).

> **CRITICAL**: Variable declarations must be ordered by type:
> Record, Report, Codeunit, XmlPort, Page, Query, then scalar types.
> Place `RecordRef` after `Codeunit` variables.

| Standard Codeunit | Event | Purpose |
|---|---|---|
| `Workflow Response Handling` | `OnReleaseDocument` | Status → Approved |
| `Workflow Response Handling` | `OnOpenDocument` | Status → Open |
| `Workflow Response Handling` | `OnAddWorkflowResponsePredecessorsToLibrary` | Link responses |
| `Page Management` | `OnConditionalCardPageIDNotFound` | Card page mapping |
| `Workflow Setup` | `OnAddWorkflowCategoriesToLibrary` | Register category |
| `Workflow Setup` | `OnAfterInsertApprovalsTableRelations` | Table → Approval Entry |
| `Workflow Setup` | `OnInsertWorkflowTemplates` | Create template |

## Rules

1. Always use the project **affix** for all object and field names.
2. Enum values must be: `Open` (0), `Pending Approval` (1), `Rejected` (2), `Approved` (3).
3. The approval status field must be `Editable = false`.
4. Event code identifiers (`Code[128]`) must be **uppercase** and unique.
5. All `Modify()` calls in approval status updates must use `Modify(true)`.
6. The workflow category code must be ≤ 20 characters and `Locked = true`.
7. If sub-tables need locking, bind `Editable` on the subpage part to the
   header's approval status = Open.
8. Follow the instruction files for naming, code style, and performance.
9. **Page editability**: Use `modify(General) { Editable = GPageEditable; }`
   where `GPageEditable` is set from `Rec.ApprovalStatusAllowModify()` in
   `OnAfterGetRecord`. Do NOT use `CurrPage.Editable` — it disables
   approval action buttons when the page is non-editable.
10. **Variable ordering**: Declare variables in AL-required order:
    Record → Report → Codeunit → XmlPort → Page → Query → scalar types.
    `RecordRef` goes after Codeunit.
11. **OnBeforeShowCommonApprovalStatus**: The parameter is `IsHandle`
    (NOT `IsHandled`). Using the wrong name silently breaks the binding.
12. **OnApproveApprovalRequest**: Use `HasOpenOrPendingApprovalEntries`
    (NOT `HasOpenPendingApprovalEntries` which does not exist).
13. **UpdateMatrixData**: The Workflow Setup codeunit must insert
    `WF Event/Response Combination` records so the workflow editor
    shows all response options for the custom events.
14. **Workflow Webhook Entry**: Register a table relation from the entity
    `SystemId` to `Workflow Webhook Entry."Data ID"` for Power Automate.
15. **Cancel action**: Must explicitly call a `Set{Entity}StatusToOpen`
    procedure on the Approval Mgmt. codeunit to revert the status.
