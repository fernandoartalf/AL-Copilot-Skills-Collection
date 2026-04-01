---
name: bc-cds-page-generator
description: Automatically generate AL list page objects for CDS (Dataverse) tables with standard CRM integration patterns. Creates list pages with proper field layouts, CRM integration actions, coupling procedures, and initialization triggers. Use when user requests to create, generate, or build a list page for a CDS/Dataverse table, or mentions creating UI for Dataverse entities. Trigger phrases include "create page for CDS table", "generate list page for [entity]", "build Dataverse page", or when working with CDS integration tables that need user interfaces.
---

# Business Central CDS Page Generator

Generates AL list page objects for CDS (Dataverse) tables with standard CRM integration patterns. Creates read-only list pages with coupling support, CreateFromCDS actions, and proper field visibility.

## Prerequisites

- CDS table exists (TableType = CDS) in `src/Table/`
- Available page ID (use Object ID Ninja or manual allocation)
- Understanding of which fields should be visible by default
- **Author prefix** defined (e.g., "BCS", "ABC", "XYZ") for consistent object naming

## Quick Reference

**Naming conventions:**
- Page name: `"[PREFIX] CDS [EntityName]"` (plural) — replace `[PREFIX]` with author prefix (e.g., "BCS CDS Countries")
- Page caption: `'Dataverse [EntityName]'`
- File name: `[PREFIX]CDS[EntityName].Page.al` — replace `[PREFIX]` (e.g., "BCSCDSCountries.Page.al")
- Entity variable: `CDS[Entity]` (e.g., `CDSCountry`, `CDSDepartment`)

> **Note:** The author's prefix in examples is "BCS". Replace with your own prefix throughout.

**Standard properties:**
- `PageType = List`
- `Editable = false` (CDS tables are read-only from BC)
- `RefreshOnActivate = true` (refresh from Dataverse on page activation)
- `UsageCategory = Lists` (makes page searchable)

## Workflow

### Step 1: Identify CDS Table and Prefix

Gather information:
1. **Author Prefix** — your organization's prefix (e.g., "BCS", "ABC", "XYZ")
2. **CDS Table Name** (e.g., "[PREFIX] CDS bcs_country")
3. **Entity Display Name** (e.g., "Countries", "Departments")  
4. **Primary Fields** — which fields are most important (code, name, key identifiers)
5. **System Fields** — standard fields that should be hidden (CreatedOn, ModifiedOn, statecode, statuscode, SystemId)

### Step 2: Determine Page ID

Find next available page ID:
```powershell
Get-ChildItem "src/Page/*.al" | 
  ForEach-Object { 
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'page\s+(\d+)') { [int]$matches[1] }
  } | Sort-Object | Select-Object -Last 1
```
Next ID = Last ID + 1

### Step 3: Generate Page Structure

Create the page file with:
1. **File path**: `src/Page/[PREFIX]CDS[EntityName].Page.al` (e.g., `BCSCDSCountries.Page.al`)
2. **Page properties** — use standard CDS list page properties
3. **Layout** — organize fields by visibility priority (see `references/field-layout.md`)
4. **Actions** — include CreateFromCDS action
5. **Triggers** — add OnInit trigger
6. **Procedures** — add SetCurrentlyCoupled[Entity] procedure

For complete code patterns and templates, read:
- `references/quick-start.md` — quick start guide with workflows and troubleshooting
- `references/field-layout.md` — field organization and visibility patterns
- `references/standard-components.md` — actions, triggers, and procedures
- `references/examples.md` — complete working examples

### Step 4: Organize Fields

**Field visibility rules:**
1. **Visible** (3-5 fields): Primary identifiers, names, key business fields
2. **Hidden** (Visible = false): Technical fields, system fields, supplementary data

**Standard field order:**
1. Primary identification fields
2. Important business fields
3. Additional business fields (hidden)
4. System fields (all hidden): CreatedOn, ModifiedOn, statecode, statuscode, SystemId

### Step 5: Add Standard Components

**Required components:**
- `CreateFromCDS` action — creates BC records from selected Dataverse records
- `OnInit` trigger — initializes CRM Integration Management
- `SetCurrentlyCoupled[Entity]` procedure — tracks coupled record in lookup scenarios

See `references/standard-components.md` for complete implementations.

### Step 6: Validate

- [ ] Page name follows `"[PREFIX] CDS [EntityName]"` pattern with your author prefix
- [ ] File name follows `[PREFIX]CDS[EntityName].Page.al` pattern
- [ ] Caption is `'Dataverse [EntityName]'`
- [ ] SourceTable references correct CDS table
- [ ] All field names match table definition (case-sensitive)
- [ ] ToolTips are meaningful
- [ ] CreateFromCDS action variable matches entity name
- [ ] SetCurrentlyCoupled procedure parameter matches entity name
- [ ] Page compiles without errors

## Field Layout Principles

**Primary fields (visible):**
- Code/Number fields
- Name/Description fields
- Key classification fields

**Hidden fields:**
- GUIDs (except for debugging)
- Audit timestamps (CreatedOn, ModifiedOn)
- Status codes (statecode, statuscode)
- SystemId

**ToolTip format:**
- Start with "Specifies"
- Be specific about what the field represents
- End with period

Example: `'Specifies the two-letter ISO country code.'`

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| **bc-dataverse-entity-generator** | Generate CDS table first, then create page |
| **bc-dataverse-mapping-generator** | Page used in lookup procedures for coupling |
| **bc-tooltip-manager** | Enhance tooltips after page generation |
| **dataverse-schema-generator** | Reference schema docs for field selection |

## Common Patterns

### Master Data Pattern
For reference entities (Country, Currency, Legal Entity):
- Show code + name
- Show key attributes (ISO codes, classifications)
- Hide most other fields

### Transactional Pattern  
For transaction entities (Order, Invoice):
- Show document number + date
- Show party fields (customer, vendor)
- Show amount/status
- Hide line-level details

### Standard CRM Entity Pattern
For OOB entities (Account, Contact, Product):
- Use base CRM table as SourceTable (e.g., `"CRM Product"`)
- Follow same field visibility rules
- Adapt entity variable names

See `EXAMPLES.md` for complete implementations of each pattern.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Fields not found | Verify field names match table exactly (case-sensitive) |
| Page doesn't display data | Check `RefreshOnActivate = true` and `OnInit` trigger present |
| CreateFromCDS action fails | Verify CRM Integration Management available and CDS connection configured |
| Compilation errors | Update variable names to match entity (CDSCountry, CDSDepartment) |

## Output Confirmation

```
CDS list page generated successfully!

Page: [ID] "BCS CDS [EntityName]"
File: src/Page/BCSCDS[EntityName].Page.al
Caption: Dataverse [EntityName]
Source: "BCS CDS [tablename]"

Visible fields: [count]
Hidden fields: [count]

Components included:
✓ CreateFromCDS action
✓ OnInit trigger
✓ SetCurrentlyCoupled[Entity] procedure

Next steps:
- Build project (Ctrl+Shift+P → AL: Build)
- Test page opens from Tell Me search
- Verify data displays from Dataverse connection
```
