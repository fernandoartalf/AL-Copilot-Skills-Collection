---
name: bc-attachments-generator
description: Implements standard document attachments, links, and notes on custom Business Central tables. Creates setup fields for visibility control, extends Attachment Document Type enum, generates event subscribers (OnBeforeDrillDown, OnAfterOpenForRecRef, OnAfterInitFieldsFromRecRef) in attachment management codeunit, adds table lifecycle triggers for orphan prevention on delete/rename, and extends card and list pages with both legacy and modern factboxes. Handles SubPageLink configuration, control ID mapping for Links (Control1900383207) and Notes (Control1905767507) factboxes. Use when adding attachments to custom tables, implementing document management, enabling factboxes for documents, creating attachment integration on entities, adding links and notes to records, or preventing orphan attachment records on table operations.
---

# BC Attachments, Links & Notes Generator

Automates BC standard document attachment functionality on custom tables.

## Overview

Generates complete attachment, link, and notes implementation for custom BC tables following Microsoft patterns. Creates 3 event subscribers, lifecycle triggers, factbox configurations, and setup controls.

**Complete code templates available in**: [references/code-templates.md](references/code-templates.md)

## Prerequisites

- AL workspace with custom table
- Setup table (or will create one)
- Card and List pages for entity

## Workflow

### Step 1: Gather Information

Collect from user:
- Entity name (e.g., "Statistical Account")
- Table name and ID
- Prefix (e.g., "BCS")
- Primary key field (usually "No.")
- Setup table name
- Card and list page names

### Step 2: Update Setup Table

Add 3 boolean fields to setup table:
- `"Enable Attachments"` (InitValue = true)
- `"Enable Links"` (InitValue = true)
- `"Enable Notes"` (InitValue = true)

Location: `src/Table/[Prefix][SetupName].Table.al`

See [code-templates.md](references/code-templates.md#setup-table-fields) for complete code.

### Step 3: Update Setup Page

Add 3 fields to setup page layout in General group.

Location: `src/Page/[Prefix][SetupName].Page.al`

See [code-templates.md](references/code-templates.md#setup-page-fields) for complete code.

### Step 4: Create Enum Extension

Extend `"Attachment Document Type"` enum with custom value.

Location: `src/Enum Extension/[Prefix]AttachmentDocType.EnumExt.al`

```al
enumextension [ID] "[Prefix] Attachment Doc Type" extends "Attachment Document Type"
{
  value([ID]; [Prefix][Entity])  // Remove spaces: "Statistical Account" → "BCSStatisticalAccount"
  {
    Caption = '[Entity]';
  }
}
```

### Step 5: Create Attachment Management Codeunit

Create codeunit with 3 event subscribers + 5 procedures.

Location: `src/Codeunit/[Prefix]AttachmentManagement.Codeunit.al`

**Event Subscribers:**
1. `OnBeforeDrillDown` - Handle obsolete factbox drill-down (Page::"Document Attachment Factbox")
2. `OnAfterOpenForRecRef` - Filter attachments when opening details (Page::"Document Attachment Details")
3. `OnAfterInitFieldsFromRecRef` - Initialize attachment from record (Table::"Document Attachment")

**Procedures:**
1. `EntityEnabledAttachments(TableId)` - Check if attachments enabled
2. `EntityEnabledLinks(TableId)` - Check if links enabled
3. `EntityEnabledNotes(TableId)` - Check if notes enabled
4. `DeleteRelatedDocumentAttachments(No)` - Delete attachments on record delete
5. `CopyRelatedDocumentAttachments(OldNo, NewNo)` - Copy attachments on rename

See [code-templates.md](references/code-templates.md#complete-attachment-management-codeunit) for complete code.

### Step 6: Add Table Lifecycle Triggers

Extend table with:
- `OnBeforeRename()` - Copy attachments to new No., delete old ones
- `OnBeforeDelete()` - Delete related attachments to prevent orphans

Location: Update existing table extension

See [code-templates.md](references/code-templates.md#table-extension-triggers) for complete code.

### Step 7: Extend Card Page

Add factboxes section with:
- Modern factbox: `"Doc. Attachment List Factbox"` (BC 25.0+, UpdatePropagation = Both)
- Legacy factbox: `"Document Attachment Factbox"` (Obsolete, Visible = false)
- Modify Links factbox: `Control1900383207`
- Modify Notes factbox: `Control1905767507`

Add `OnOpenPage()` trigger to set visibility variables.

Location: `src/Page Extension/[Prefix][Entity]Card.PageExt.al`

**SubPageLink configuration:**
```al
SubPageLink = "Table ID" = const(Database::"[Base Table]"),
              "No." = field("No.");
```

See [code-templates.md](references/code-templates.md#page-extension-card-page-factboxes) for complete code.

**Control ID Note**: If modify fails (e.g., "Control not found"), inspect base page to find actual IDs. They may vary between BC versions.

### Step 8: Extend List Page

Repeat Step 7 for list page.

Location: `src/Page Extension/[Prefix][Entity]List.PageExt.al`

### Step 9: Update Permissions

Add to permission set:
```al
codeunit "[Prefix] Attachment Management" = X;
```

### Step 10: Test

**Critical tests:**
1. Upload attachment → verify appears in factbox
2. Delete record → verify attachments deleted
3. Rename record → verify attachments follow (copied to new No.)
4. Navigate between records → verify factbox refreshes
5. Toggle setup fields → verify factboxes hide/show

## Troubleshooting

### Factboxes Not Appearing
- Check setup page: ensure "Enable Attachments/Links/Notes" checked
- Verify `OnOpenPage()` trigger runs and sets variables
- Confirm `DATABASE::"[Table]"` matches exactly (case-sensitive)

### Attachments Not Filtering
- Verify enum extension exists and builds first
- Check `SubPageLink` includes correct `"Table ID"` and `"No."` field
- Confirm `OnAfterInitFieldsFromRecRef` sets `"Document Type"` correctly

### Orphan Attachments After Delete/Rename
- Missing `OnBeforeDelete` trigger → Add and call `DeleteRelatedDocumentAttachments()`
- Missing `OnBeforeRename` trigger → Add `RenameAttachments()` procedure

### Links/Notes Factbox Visibility Not Working
- Wrong control IDs → Inspect base page to find actual IDs
- Common IDs: `1900383207` (Links), `1905767507` (Notes)
- Base page may not have these factboxes

### Factbox Not Refreshing on Navigation
- Missing `UpdatePropagation = Both` on modern factbox
- Add to `"Doc. Attachment List Factbox"` part

## Multi-Entity Pattern

When adding attachments to multiple tables in one extension, use case statements in all event subscribers and procedures.

See [code-templates.md](references/code-templates.md#multi-entity-support-pattern) for complete example.

## Storage Best Practice

BC has database storage limits. Recommend:
- Small files in BC attachments (< 1 MB)
- Large files in SharePoint/OneDrive
- Use Links factbox for SharePoint URLs

## Quick Reference

**Required Objects:**
- Setup fields (3 booleans)
- Enum extension
- Attachment management codeunit (3 event subscribers, 5 procedures)
- Table triggers (OnBeforeDelete, OnBeforeRename)
- Page factboxes (card and list)

**Event Subscribers:**
- `OnBeforeDrillDown` (obsolete factbox)
- `OnAfterOpenForRecRef` (details page)
- `OnAfterInitFieldsFromRecRef` (initialization)

**Factbox Control IDs:**
- Links: `Control1900383207`
- Notes: `Control1905767507`
- May vary by BC version

**Real-world example:** [BC Scout Statistical Accounts](https://github.com/fernandoartalf/BC-Scout-Path)

3. Rename record → verify attachments follow (copied to new No.)
4. Navigate between records → verify factbox refreshes
5. Toggle setup fields → verify factboxes hide/show

## Troubleshooting

### Factboxes Not Appearing
- Check setup page: ensure "Enable Attachments/Links/Notes" checked
- Verify `OnOpenPage()` trigger runs and sets variables
- Confirm `DATABASE::"[Table]"` matches exactly (case-sensitive)

### Attachments Not Filtering
- Verify enum extension exists and builds first
- Check `SubPageLink` includes correct `"Table ID"` and `"No."` field
- Confirm `OnAfterInitFieldsFromRecRef` sets `"Document Type"` correctly

### Orphan Attachments After Delete/Rename
- Missing `OnBeforeDelete` trigger → Add and call `DeleteRelatedDocumentAttachments()`
- Missing `OnBeforeRename` trigger → Add `RenameAttachments()` procedure

### Links/Notes Factbox Visibility Not Working
- Wrong control IDs → Inspect base page to find actual IDs
- Common IDs: `1900383207` (Links), `1905767507` (Notes)
- Base page may not have these factboxes

### Factbox Not Refreshing on Navigation
- Missing `UpdatePropagation = Both` on modern factbox
- Add to `"Doc. Attachment List Factbox"` part

## Multi-Entity Pattern

When adding attachments to multiple tables in one extension, use case statements in all event subscribers and procedures.

See [code-templates.md](references/code-templates.md#multi-entity-support-pattern) for complete example.

## Storage Best Practice

BC has database storage limits. Recommend:
- Small files in BC attachments (< 1 MB)
- Large files in SharePoint/OneDrive
- Use Links factbox for SharePoint URLs

## Quick Reference

**Required Objects:**
- Setup fields (3 booleans)
- Enum extension
- Attachment management codeunit (3 event subscribers, 5 procedures)
- Table triggers (OnBeforeDelete, OnBeforeRename)
- Page factboxes (card and list)

**Event Subscribers:**
- `OnBeforeDrillDown` (obsolete factbox)
- `OnAfterOpenForRecRef` (details page)
- `OnAfterInitFieldsFromRecRef` (initialization)

**Factbox Control IDs:**
- Links: `Control1900383207`
- Notes: `Control1905767507`
- May vary by BC version

**Real-world example:** [BC Scout Statistical Accounts](https://github.com/fernandoartalf/BC-Scout-Path)


