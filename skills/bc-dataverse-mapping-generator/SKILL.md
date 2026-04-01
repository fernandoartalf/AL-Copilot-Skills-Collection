---
name: bc-dataverse-mapping-generator
description: Generates AL event subscriber code for Dataverse/CDS integration table and field mappings in Business Central. Creates all required event subscribers in the BCS Dataverse Events codeunit and lookup procedures in BCS Dataverse Support Funct. codeunit. Handles TWO distinct scenarios — (1) NEW CUSTOM entities (bcs_ prefix, custom BC table paired with CDS table, requiring full mapping with OnGetCDSTableNo, OnLookupCRMTables, OnAddEntityTableMapping, OnAfterResetConfiguration, lookup procedures, and label declarations) and (2) OOB entities (standard BC tables like Customer, Item, Contact mapped to existing CRM tables like CRM Account, CRM Product, CRM Contact, only requiring extra field mappings via AddNewExtraFieldMappings plus table extensions and page extensions). Use when asked to create sync mappings, set up Dataverse synchronization, add integration table mappings, map BC fields to Dataverse fields, wire up CDS coupling, connect BC tables to Dataverse entities, or add extra field mappings for standard entities.
---

# Business Central Dataverse Mapping Generator

Generates AL event subscriber code to wire up Dataverse/CDS integration synchronization. Covers both custom entities (full mapping setup) and OOB entities (extra field mappings on standard CRM tables).

## Prerequisites

- CDS table exists in `src/Table/` (TableType = CDS) or is a standard CRM table from the base application
- For custom entities: corresponding BC table and CDS list page exist
- Codeunits `BCS Dataverse Events` (70001) and `BCS Dataverse Support Funct.` (70002) exist
- Permission set updated with table permissions

## Step 1: Determine Entity Type

**This is the critical first step.** The entire workflow differs based on entity type.

```
IF the CDS table has TableType = CDS with ExternalName starting with "bcs_" or a custom prefix
   AND the BC table is a NEW custom table (not Customer, Item, Contact, Vendor, etc.)
   → Use CUSTOM ENTITY path (read references/custom-entity-mapping.md)

IF the BC table is a STANDARD base-app table (Customer, Item, Contact, Vendor, Opportunity, etc.)
   AND the CDS table is a standard CRM table (CRM Account, CRM Product, CRM Contact, CRM Opportunity)
   OR you are adding custom Dataverse fields to an existing standard sync
   → Use OOB ENTITY path (read references/oob-entity-mapping.md)
```

| Criteria | Custom Entity | OOB Entity |
|----------|--------------|------------|
| **Dataverse entity** | Custom (bcs_ prefix) | Standard CRM entity |
| **BC table** | New custom table | Standard BC table (Customer, Item, etc.) |
| **CDS table source** | Generated via ALTPGen | Already in base application |
| **Event subscribers** | Full set (5 events + lookup) | Only `AddNewExtraFieldMappings` |
| **Table extension** | Not needed | Yes — to add custom fields to standard BC table |
| **Page extension** | Not needed | Yes — to expose custom fields on standard pages |
| **Reference file** | `references/custom-entity-mapping.md` | `references/oob-entity-mapping.md` |

## Step 2: Read the Appropriate Reference

Based on entity type, read the corresponding reference file for complete code patterns, examples, and step-by-step instructions:

- **Custom entity**: Read `references/custom-entity-mapping.md`
- **OOB entity**: Read `references/oob-entity-mapping.md`

## Step 3: Gather Entity Information

### For Custom Entities
1. **BC Table Name** (e.g., "BCS Department")
2. **CDS Table Name** (e.g., "BCS CDS bcs_department")
3. **Entity Logical Name** (e.g., "bcs_department")
4. **Primary Key Field** (e.g., "bcs_departmentId")
5. **Field Mappings** — BC field → CDS field with sync direction
6. **CDS List Page Name** (e.g., "BCS CDS Departments")

### For OOB Entities
1. **Standard BC Table** (e.g., Item, Customer, Contact)
2. **CRM Table** (e.g., CRM Product, CRM Account, CRM Contact)
3. **New Fields** — custom Dataverse fields to map (e.g., "bcs_countryid")
4. **Sync Direction** per field
5. **Standard Page** to extend (e.g., Item Card, Customer Card)

## Field Mapping Direction Reference

| Direction | Value | When to use |
|-----------|-------|-------------|
| Bidirectional | `IntegrationFieldMapping.Direction::Bidirectional` | Field updated from either system |
| To Dataverse | `IntegrationFieldMapping.Direction::ToIntegrationTable` | BC is master for this field |
| From Dataverse | `IntegrationFieldMapping.Direction::FromIntegrationTable` | Dataverse is master for this field |

## Event Subscriber Summary

### Custom Entity — All 5 Required

| # | Event | Codeunit | Purpose |
|---|-------|----------|---------|
| 1 | `OnGetCDSTableNo` | CRM Setup Defaults | Maps BC table no. → CDS table no. |
| 2 | `OnLookupCRMTables` | Lookup CRM Tables | Routes lookup to support function |
| 3 | `OnAddEntityTableMapping` | CRM Setup Defaults | Registers entity for coupling UI |
| 4 | `OnAfterResetConfiguration` | CDS Setup Defaults | Creates table + field mappings |
| 5 | `OnAfterAddExtraIntegrationFieldMappings` | CDS Setup Defaults | Already exists — no changes |

Plus: `Handle{Entity}Integration` procedure, `LookupCDS{Entity}` procedure, Label declaration.

### OOB Entity — Only Extra Field Mappings

| # | Change | Location |
|---|--------|----------|
| 1 | Add field mapping call | `AddNewExtraFieldMappings` in Support Funct. |
| 2 | Create table extension | `src/Table Extension/` — new field on standard BC table |
| 3 | Create page extension | `src/Page Extension/` — expose field on standard page |

No new event subscribers needed — base application handles core sync.

## Validation Checklist

### Custom Entity
- [ ] Case added to `HandleOnGetCDSTableNo`
- [ ] Case added to `HandleOnLookupCRMTables`
- [ ] Entity registered in `HandleOnAddEntityTableMapping`
- [ ] `Handle{Entity}Integration` procedure created with table + field mappings
- [ ] Call added in `HandleOnAfterResetConfiguration`
- [ ] Label declared for mapping name
- [ ] `LookupCDS{Entity}` procedure added to support functions
- [ ] CDS list page has `SetCurrentlyCoupled{Entity}` procedure

### OOB Entity
- [ ] Table extension created with new field(s) in correct ID range
- [ ] Field mapping added in `AddNewExtraFieldMappings` with CRM table guard
- [ ] Page extension created to expose field(s)
- [ ] Permission set updated
- [ ] Mapping line commented with duplicate warning

## Completion Output

```
Dataverse mapping generated for {Entity}

Type: {Custom Entity | OOB Entity Extra Fields}
BC Table: "{BC Table Name}"
CDS Table: "{CDS Table Name}"

Modified files:
- src/Codeunit/BCSDataverseEvents.Codeunit.al
- src/Codeunit/BCSDataverseSupportFunct.Codeunit.al
{- src/Table Extension/{file} (if OOB)}
{- src/Page Extension/{file} (if OOB)}

Field mappings:
| BC Field | CDS Field | Direction |
|----------|-----------|-----------|
| {field}  | {field}   | {dir}     |

Next steps:
- Build project (Ctrl+Shift+P → AL: Build)
- Reset Dataverse configuration (CDS Connection Setup → Reset Configuration)
- Run full synchronization to test
```
