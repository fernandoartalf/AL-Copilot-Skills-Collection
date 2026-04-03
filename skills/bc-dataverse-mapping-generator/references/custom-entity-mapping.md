# Custom Entity Mapping — Complete Code Reference

Reference for mapping **new custom Dataverse entities** (bcs_ prefix) to new custom BC tables. This is the full mapping path requiring 5 event subscriber modifications and a lookup procedure.

## Working Example: Department Entity

All patterns below are taken from the actual codebase — Department (custom BC table) mapped to bcs_department (custom Dataverse entity).

### Existing objects involved

| Object | Type | Name |
|--------|------|------|
| BC Table | Table 70006 | "BCS Department" |
| CDS Table | Table 70002 | "BCS CDS bcs_department" (TableType = CDS) |
| CDS List Page | Page 70007 | "BCS CDS Departments" |
| Events CU | Codeunit 70001 | "BCS Dataverse Events" |
| Support CU | Codeunit 70002 | "BCS Dataverse Support Funct." |

---

## Event 1: OnGetCDSTableNo

**Purpose:** Maps BC table number to CDS table number so the integration framework knows which CDS table corresponds to which BC table.

**Location:** `HandleOnGetCDSTableNo` in BCS Dataverse Events codeunit.

**Pattern — add a case branch:**

```al
Database::"BCS Department":
    begin
        CDSTableNo := DATABASE::"BCS CDS bcs_department";
        handled := true;
    end;
```

**Full subscriber context:**

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"CRM Setup Defaults", 'OnGetCDSTableNo', '', false, false)]
local procedure HandleOnGetCDSTableNo(BCTableNo: Integer; var CDSTableNo: Integer; var handled: Boolean)
begin
    case BCTableNo of
        DATABASE::"Country/Region":
            begin
                CDSTableNo := DATABASE::"BCS CDS bcs_country";
                handled := true;
            end;
        Database::"BCS Legal Entity":
            begin
                CDSTableNo := DATABASE::"BCS CDS bcs_legalentity";
                handled := true;
            end;
        Database::"BCS Department":  // ← NEW
            begin
                CDSTableNo := DATABASE::"BCS CDS bcs_department";
                handled := true;
            end;
    end;
end;
```

---

## Event 2: OnLookupCRMTables

**Purpose:** Routes CDS table lookups to the correct lookup procedure so users can pick a Dataverse record to couple.

**Location:** `HandleOnLookupCRMTables` in BCS Dataverse Events codeunit.

**Pattern — add a case branch:**

```al
Database::"BCS CDS bcs_department":
    Handled := BCSDataverseSupportFunct.LookupCDSDepartment(SavedCRMId, CRMId, IntTableFilter);
```

**Full subscriber context:**

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Lookup CRM Tables", 'OnLookupCRMTables', '', true, true)]
local procedure HandleOnLookupCRMTables(CRMTableID: Integer; NAVTableId: Integer; SavedCRMId: Guid; var CRMId: Guid; IntTableFilter: Text; var Handled: Boolean)
begin
    case CRMTableID of
        Database::"BCS CDS bcs_country":
            Handled := BCSDataverseSupportFunct.LookupCDSCountry(SavedCRMId, CRMId, IntTableFilter);
        Database::"BCS CDS bcs_legalentity":
            Handled := BCSDataverseSupportFunct.LookupCDSLegalEntity(SavedCRMId, CRMId, IntTableFilter);
        Database::"BCS CDS bcs_department":  // ← NEW
            Handled := BCSDataverseSupportFunct.LookupCDSDepartment(SavedCRMId, CRMId, IntTableFilter);
    end;
end;
```

---

## Event 3: OnAddEntityTableMapping

**Purpose:** Registers the entity in the coupling list so it appears in the Dataverse setup pages.

**Location:** `HandleOnAddEntityTableMapping` in BCS Dataverse Events codeunit.

**Pattern — add a call:**

```al
BCSDataverseSupportFunct.AddEntityTableMapping(BCSCDSDepartmentLbl, DATABASE::"BCS CDS bcs_department", TempNameValueBuffer);
```

**Full subscriber context:**

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"CRM Setup Defaults", 'OnAddEntityTableMapping', '', true, true)]
local procedure HandleOnAddEntityTableMapping(var TempNameValueBuffer: Record "Name/Value Buffer" temporary);
begin
    BCSDataverseSupportFunct.AddEntityTableMapping(BCSCDSCountryLbl, DATABASE::"BCS CDS bcs_country", TempNameValueBuffer);
    BCSDataverseSupportFunct.AddEntityTableMapping(BCSCDSDepartmentLbl, DATABASE::"BCS CDS bcs_department", TempNameValueBuffer);  // ← NEW
end;
```

---

## Event 4: OnAfterResetConfiguration

**Purpose:** Creates the `Integration Table Mapping` and `Integration Field Mapping` records that define which fields sync and in which direction.

**Location:** `HandleOnAfterResetConfiguration` in BCS Dataverse Events codeunit.

**Pattern — add a call to the new handler procedure:**

```al
HandleDepartmentIntegration(IntegrationTableMapping, IntegrationFieldMapping);
```

**Full subscriber context:**

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"CDS Setup Defaults", 'OnAfterResetConfiguration', '', true, true)]
local procedure HandleOnAfterResetConfiguration(CDSConnectionSetup: Record "CDS Connection Setup")
var
    IntegrationTableMapping: Record "Integration Table Mapping";
    IntegrationFieldMapping: Record "Integration Field Mapping";
begin
    HandleCountryIntegration(IntegrationTableMapping, IntegrationFieldMapping);
    HandleLegalEntityIntegration(IntegrationTableMapping, IntegrationFieldMapping);
    HandleDepartmentIntegration(IntegrationTableMapping, IntegrationFieldMapping);  // ← NEW
end;
```

---

## Handler Procedure: Handle{Entity}Integration

**Purpose:** Creates the table mapping and all field mappings for the entity.

**Location:** Local procedure in BCS Dataverse Events codeunit.

**Complete procedure:**

```al
local procedure HandleDepartmentIntegration(var IntegrationTableMapping: Record "Integration Table Mapping"; var IntegrationFieldMapping: Record "Integration Field Mapping")
var
    BCSCDSDepartment: Record "BCS CDS bcs_department";
    BCSDept: Record "BCS Department";
begin
    // 1. Create Integration Table Mapping
    BCSDataverseSupportFunct.InsertIntegrationTableMapping(
        IntegrationTableMapping, BCSCDSDepartmentLbl,
        DATABASE::"BCS Department", DATABASE::"BCS CDS bcs_department",
        BCSCDSDepartment.FieldNo(bcs_departmentId),   // Primary key in CDS table
        BCSCDSDepartment.FieldNo(ModifiedOn),          // Modified timestamp for delta sync
        '', '', true);                                  // SynchOnlyCoupledRecords = true

    // 2. Map primary key
    BCSDataverseSupportFunct.InsertIntegrationFieldMapping(
        BCSCDSDepartmentLbl,
        BCSDept.FieldNo("Department ID"),
        BCSCDSDepartment.FieldNo(bcs_departmentId),
        IntegrationFieldMapping.Direction::Bidirectional, '', true, false);

    // 3. Map name field
    BCSDataverseSupportFunct.InsertIntegrationFieldMapping(
        BCSCDSDepartmentLbl,
        BCSDept.FieldNo(bcs_Name),
        BCSCDSDepartment.FieldNo(bcs_Name),
        IntegrationFieldMapping.Direction::Bidirectional, '', true, false);

    // 4. Map lookup/relationship fields
    BCSDataverseSupportFunct.InsertIntegrationFieldMapping(
        BCSCDSDepartmentLbl,
        BCSDept.FieldNo(bcs_legalentityid),
        BCSCDSDepartment.FieldNo(bcs_legalentityid),
        IntegrationFieldMapping.Direction::Bidirectional, '', true, false);
end;
```

**InsertIntegrationTableMapping parameters:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| MappingName | Label for the mapping (Code[20]) | `BCSCDSDepartmentLbl` |
| TableNo | BC table database ID | `DATABASE::"BCS Department"` |
| IntegrationTableNo | CDS table database ID | `DATABASE::"BCS CDS bcs_department"` |
| IntegrationTableUIDFieldNo | Primary key field no. in CDS table | `BCSCDSDepartment.FieldNo(bcs_departmentId)` |
| IntegrationTableModifiedFieldNo | ModifiedOn field no. in CDS table | `BCSCDSDepartment.FieldNo(ModifiedOn)` |
| TableConfigTemplateCode | Config template for BC table (usually empty) | `''` |
| IntegrationTableConfigTemplateCode | Config template for CDS table (usually empty) | `''` |
| SynchOnlyCoupledRecords | Only sync records that are coupled | `true` |

**InsertIntegrationFieldMapping parameters:**

| Parameter | Description |
|-----------|-------------|
| IntegrationTableMappingName | Same label as the table mapping |
| TableFieldNo | Field number in BC table |
| IntegrationTableFieldNo | Field number in CDS table |
| SynchDirection | `Bidirectional`, `ToIntegrationTable`, or `FromIntegrationTable` |
| ConstValue | Constant value (usually empty `''`) |
| ValidateField | Validate BC field on sync (`true`/`false`) |
| ValidateIntegrationTableField | Validate CDS field on sync (`true`/`false`) |

**Duplicate prevention:**

The `InsertIntegrationFieldMapping` procedure includes automatic duplicate prevention via the `IsNewTableMapping` check. This prevents errors when:
- Reset Configuration is run multiple times
- A mapping already exists from a previous setup
- Re-running the same handler procedure

The procedure silently skips creating the field mapping if it already exists for the same mapping name + field pair.

---

## Label Declaration

**Purpose:** Label variable used as the mapping name across all event subscribers.

**Location:** `var` section of BCS Dataverse Events codeunit.

```al
var
    BCSDataverseSupportFunct: Codeunit "BCS Dataverse Support Funct.";
    BCSCDSCountryLbl: Label 'bcs_country';
    BCSCDSLegalEntityLbl: Label 'bcs_legalentity';
    BCSCDSDepartmentLbl: Label 'bcs_department';  // ← NEW
```

**Naming convention:** `BCSCDS{EntityName}Lbl` with value being the Dataverse entity logical name.

---

## Lookup Procedure: LookupCDS{Entity}

**Purpose:** Opens the CDS list page as a lookup, pre-selects the currently coupled record, and returns the selected GUID.

**Location:** BCS Dataverse Support Funct. codeunit (public procedure).

**Complete procedure:**

```al
procedure LookupCDSDepartment(SavedCRMId: Guid; var CRMId: Guid; IntTableFilter: Text): Boolean
var
    BCSCDSDepartment: Record "BCS CDS bcs_department";
    OriginalBCSCDSDepartment: Record "BCS CDS bcs_department";
    BCSCDSDepartments: Page "BCS CDS Departments";
begin
    if not IsNullGuid(CRMId) then begin
        if BCSCDSDepartment.Get(CRMId) then
            BCSCDSDepartments.SetRecord(BCSCDSDepartment);
        if not IsNullGuid(SavedCRMId) then
            if OriginalBCSCDSDepartment.Get(SavedCRMId) then
                BCSCDSDepartments.SetCurrentlyCoupledDepartment(OriginalBCSCDSDepartment);
    end;
    BCSCDSDepartment.SetView(IntTableFilter);
    BCSCDSDepartments.SetTableView(BCSCDSDepartment);
    BCSCDSDepartments.LookupMode(true);
    if BCSCDSDepartments.RunModal() = ACTION::LookupOK then begin
        BCSCDSDepartments.GetRecord(BCSCDSDepartment);
        CRMId := BCSCDSDepartment.bcs_departmentId;
        exit(true);
    end;
    exit(false);
end;
```

**Key points:**
- The CDS list page MUST have a `SetCurrentlyCoupled{Entity}` procedure
- Returns `true` if user selected a record, `false` if cancelled
- Uses the primary key GUID field for coupling

---

## CDS List Page Requirement

The CDS list page must expose a `SetCurrentlyCoupled{Entity}` procedure for the lookup to work:

```al
procedure SetCurrentlyCoupledDepartment(Department: Record "BCS CDS bcs_department")
begin
    CurrentlyCoupledDepartment := Department;
end;

var
    CurrentlyCoupledDepartment: Record "BCS CDS bcs_department";
```

If the page doesn't exist, use the **bc-cds-page-generator** skill to create it first.

---

## Template: New Entity Placeholder

Replace all `{placeholders}` when generating for a new entity:

| Placeholder | Example |
|-------------|---------|
| `{BCTableName}` | "BCS Department" |
| `{CDSTableName}` | "BCS CDS bcs_department" |
| `{EntityLogicalName}` | bcs_department |
| `{EntityName}` | Department |
| `{PrimaryKeyField}` | bcs_departmentId |
| `{CDSListPageName}` | "BCS CDS Departments" |
| `{LabelVar}` | BCSCDSDepartmentLbl |
| `{LabelValue}` | 'bcs_department' |

---

## IsNewTableMapping — Duplicate Prevention

The `IsNewTableMapping` procedure is a local helper function in the BCS Dataverse Support Funct. codeunit that prevents duplicate field mappings from being created.

### Purpose

When `OnAfterResetConfiguration` is triggered (e.g., via "Reset Configuration" in CDS Connection Setup), all handler procedures run again. Without duplicate checking, this would attempt to create the same field mappings multiple times, causing errors.

### Implementation

```al
local procedure IsNewTableMapping(IntegrationTableMappingName: Code[20]; TableFieldNo: Integer; IntegrationTableFieldNo: Integer): boolean
var
    ExistingIntegrationFieldMapping: Record "Integration Field Mapping";
begin
    ExistingIntegrationFieldMapping.reset();
    ExistingIntegrationFieldMapping.setrange("Integration Table Mapping Name", IntegrationTableMappingName);
    ExistingIntegrationFieldMapping.setrange("Field No.", TableFieldNo);
    ExistingIntegrationFieldMapping.setrange("Integration Table Field No.", IntegrationTableFieldNo);
    exit(ExistingIntegrationFieldMapping.IsEmpty());
end;
```

### How it works

1. **Queries** the Integration Field Mapping table
2. **Filters** by three key fields:
   - `Integration Table Mapping Name` — the mapping label (e.g., 'bcs_department')
   - `Field No.` — BC table field number
   - `Integration Table Field No.` — CDS table field number
3. **Returns `true`** if no matching record exists (`IsEmpty()` = true)
4. **Returns `false`** if a mapping already exists

### Usage in InsertIntegrationFieldMapping

```al
procedure InsertIntegrationFieldMapping(IntegrationTableMappingName: Code[20]; TableFieldNo: Integer; IntegrationTableFieldNo: Integer; SynchDirection: Option; ConstValue: Text; ValidateField: Boolean; ValidateIntegrationTableField: Boolean)
var
    IntegrationFieldMapping: Record "Integration Field Mapping";
begin
    if not IsNewTableMapping(IntegrationTableMappingName, TableFieldNo, IntegrationTableFieldNo) then
        exit;  // Mapping already exists — skip creation
    IntegrationFieldMapping.CreateRecord(IntegrationTableMappingName, TableFieldNo, IntegrationTableFieldNo, SynchDirection,
        ConstValue, ValidateField, ValidateIntegrationTableField);
end;
```

### When this matters

| Scenario | Without Check | With Check |
|----------|--------------|-----------|
| First reset configuration | Creates mappings ✓ | Creates mappings ✓ |
| Second reset configuration | Error: duplicate mapping ✗ | Skips existing, creates new ✓ |
| Adding new field to existing entity | Error on existing fields ✗ | Skips existing, adds new field only ✓ |
| Re-running handler procedure | Error ✗ | Safe ✓ |

### Developer impact

**You don't need to worry about duplicates** when calling `InsertIntegrationFieldMapping`. The procedure handles re-entrancy automatically. This means:
- ✓ Safe to add new field mappings to existing entities
- ✓ Safe to re-run reset configuration
- ✓ No manual duplicate checking needed in handler procedures
- ✓ Idempotent field mapping creation
