# Quick Start Guide

Generate AL list pages for CDS (Dataverse) tables with proper integration patterns.

> **Important:** Replace "BCS" with your organization's prefix throughout all examples.

## Simple Request Pattern

```
"Create a list page for the [PREFIX] CDS [tablename]"
```

**Examples:**
- `"Create a list page for BCS CDS bcs_country table"`
- `"Generate a Dataverse page for the Account CDS table"`
- `"Build a list page for Contact entity from Dataverse"`

---

## Prerequisites

Before generating a CDS page, ensure:

- ✅ **CDS table exists** — TableType = CDS in `src/Table/`
- ✅ **Available page ID** — Use Object ID Ninja or manual allocation
- ✅ **Field knowledge** — Know which fields should be visible by default

---

## Basic Request Examples

### Example 1: Master Data — Country Entity

**Request:**
```
"Create a list page for BCS CDS bcs_country table"
```

**What you get:**
- Page with code, name, ISO codes visible
- System fields (CreatedOn, ModifiedOn, SystemId) hidden
- CreateFromCDS action
- Standard CRM integration

**File created:** `src/Page/BCSCDSCountries.Page.al`

---

### Example 2: Standard CRM — Account Entity

**Request:**
```
"Generate a Dataverse page for the Account CDS table"
```

**What you get:**
- Page with account number, name, type visible
- Standard CDS actions
- Email field visible
- Phone field hidden but available

**File created:** `src/Page/BCSCDSAccounts.Page.al`

---

### Example 3: Transactional — Contact Entity

**Request:**
```
"Build a list page for Contact entity from Dataverse"
```

**What you get:**
- Page with contact name, email, phone visible
- Job title hidden but available
- Coupling procedure included
- Standard CRM integration

**File created:** `src/Page/BCSCDSContacts.Page.al`

---

## What Every Page Includes

Every generated CDS list page automatically includes:

| Component | Details |
|-----------|---------|
| ✅ **Properties** | `Editable = false`, `RefreshOnActivate = true`, `UsageCategory = Lists` |
| ✅ **Layout** | Organized fields (primary visible, system hidden) |
| ✅ **CreateFromCDS Action** | Creates BC records from selected Dataverse records |
| ✅ **OnInit Trigger** | Initializes CRM Integration Management |
| ✅ **Coupling Procedure** | `SetCurrentlyCoupled[Entity]` for lookup scenarios |

---

## Page Structure Preview

```al
page 70XXX "[PREFIX] CDS [EntityName]"
{
    ApplicationArea = All;
    Caption = 'Dataverse [EntityName]';
    PageType = List;
    SourceTable = "[PREFIX] CDS [tablename]";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Primary fields (visible)
                field(code; Rec.code) { ... }
                field(name; Rec.name) { ... }
                
                // System fields (hidden)
                field(CreatedOn; Rec.CreatedOn) { Visible = false; }
                field(SystemId; Rec.SystemId) { Visible = false; }
            }
        }
    }

    actions
    {
        area(processing)
        {
            action(CreateFromCDS)
            {
                Caption = 'Create in Business Central';
                // ... creates records from Dataverse
            }
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

    procedure SetCurrentlyCoupled[Entity]([Entity]: Record "[PREFIX] CDS [tablename]")
    begin
        CurrentlyCoupled[Entity] := [Entity];
    end;

    var
        CurrentlyCoupled[Entity]: Record "[PREFIX] CDS [tablename]";
}
```

---

## Common Workflows

### Workflow 1: New CDS Entity (Full Stack)

1. **Generate CDS table** using `bc-dataverse-entity-generator`
   ```
   "Generate a CDS table for bcs_employee entity"
   ```

2. **Generate list page** using `bc-cds-page-generator`
   ```
   "Create a list page for BCS CDS bcs_employee"
   ```

3. **Test the page**
   - Build project
   - Search for "Dataverse Employees" in Tell Me
   - Verify data displays from Dataverse

---

### Workflow 2: Existing CDS Table

1. **Identify CDS table name**
   - Check `src/Table/` for existing CDS tables
   - Note the exact table name (case-sensitive)

2. **Request page generation**
   ```
   "Create a list page for BCS CDS bcs_department"
   ```

3. **Specify important fields**
   - Let the skill know which fields are primary
   - Mention any fields that should be visible/hidden

---

### Workflow 3: Custom Visibility Control

1. **Generate standard page**
   ```
   "Create a list page for BCS CDS bcs_product"
   ```

2. **Request visibility changes**
   ```
   "Make the description field visible"
   "Hide the price field"
   ```

3. **Add custom actions** (optional)
   ```
   "Add an action to sync prices from Dataverse"
   ```

---

## Field Visibility Rules

### Always Visible (3-5 fields)
- **Primary code/number** — e.g., `bcs_countrycode`, `accountnumber`
- **Primary name** — e.g., `bcs_countryname`, `name`
- **Key identifiers** — e.g., ISO codes, classification fields
- **Important business fields** — e.g., email, type, category

### Always Hidden (Visible = false)
- **System timestamps** — `CreatedOn`, `ModifiedOn`
- **Status fields** — `statecode`, `statuscode`
- **System identifiers** — `SystemId`
- **Technical GUIDs** — reference IDs, lookup IDs
- **Supplementary fields** — nice-to-have but not essential

### Optional Visibility
- **Contact information** — phone, fax (often hidden by default)
- **Address fields** — usually hidden unless critical
- **Description fields** — depends on entity type
- **Reference fields** — depends on usage pattern

---

## Request Customization

### Specify Field Visibility
```
"Create a list page for BCS CDS bcs_department showing code, name, and manager, but hide timestamps"
```

### Request Specific Fields
```
"Generate a page for Product showing product number, name, price, and type"
```

### Add Custom Actions
```
"Create a Contact page with an action to sync email addresses back to Business Central"
```

### Minimal Page
```
"Create a simple page for the entity with just ID and name visible"
```

---

## Integration with Other Skills

| Skill | Use Case | Typical Sequence |
|-------|----------|------------------|
| **bc-dataverse-entity-generator** | Generate CDS table first | 1. Generate table → 2. Generate page |
| **bc-dataverse-mapping-generator** | Create sync mappings | 1. Generate page → 2. Create mappings |
| **bc-tooltip-manager** | Enhance tooltips | 1. Generate page → 2. Improve tooltips |
| **dataverse-schema-generator** | Reference schema docs | 1. Document schema → 2. Generate page |

---

## Troubleshooting

### Common Issues

**Issue: "CDS table not found"**
- **Solution:** Verify table exists in `src/Table/` with exact name
- **Check:** Table has `TableType = CDS` property

**Issue: "Fields don't match"**
- **Solution:** Ensure field names are case-sensitive exact matches
- **Check:** Compare with table definition

**Issue: "Page doesn't show data"**
- **Solution:** Verify Dataverse connection configured
- **Check:** `RefreshOnActivate = true` property set
- **Check:** `OnInit` trigger present

**Issue: "CreateFromCDS action fails"**
- **Solution:** Ensure CRM Integration Management available
- **Check:** Dataverse connection active
- **Check:** Table mapping exists

---

## Next Steps After Generation

1. **Build the project**
   ```
   Ctrl+Shift+P → AL: Build
   ```

2. **Test the page**
   - Open Business Central
   - Search "Dataverse [EntityName]" in Tell Me
   - Verify fields display correctly

3. **Verify data sync**
   - Check data loads from Dataverse
   - Test CreateFromCDS action
   - Verify coupling works

4. **Customize further** (optional)
   - Add field visibility changes
   - Include custom actions
   - Enhance tooltips using bc-tooltip-manager

---

## Tips for Best Results

✅ **Be specific about fields** — mention which fields are important
✅ **Use entity type** — specify if it's master data, transactional, or reference
✅ **Mention prefix** — clarify if using different prefix than BCS
✅ **Request examples** — ask to see examples before generation
✅ **Review field layout** — check field order matches business needs

🚫 **Avoid** — requesting too many visible fields (clutters UI)
🚫 **Avoid** — making system fields visible (confuses users)
🚫 **Avoid** — skipping OnInit trigger (breaks CRM integration)

---

## Quick Reference Commands

| What You Want | Request Pattern |
|---------------|----------------|
| Standard page | `"Create a list page for [CDS table]"` |
| Custom visibility | `"Create page showing [field1], [field2], hide [field3]"` |
| With custom action | `"Create page with action to [custom logic]"` |
| Minimal page | `"Create simple page with just ID and name"` |
| Check examples | `"Show me examples of CDS pages"` |

---

For complete code patterns and detailed implementations, see:
- `references/field-layout.md` — Field organization patterns
- `references/standard-components.md` — Actions, triggers, procedures
- `references/examples.md` — Complete working examples
