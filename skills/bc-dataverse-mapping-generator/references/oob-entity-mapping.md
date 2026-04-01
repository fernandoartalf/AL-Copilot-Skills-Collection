# OOB Entity Mapping — Extra Field Mappings Reference

Reference for adding **custom Dataverse fields** to standard BC entities that already have built-in CRM synchronization. No new event subscribers are needed — only extra field mappings plus table/page extensions.

## How OOB Integration Differs

The base application already handles the core sync for standard entity pairs:

| BC Table | CRM Table | Base App Mapping |
|----------|-----------|-----------------|
| Customer | CRM Account | Name, Address, Phone, etc. |
| Vendor | CRM Account | Name, Address, Phone, etc. |
| Contact | CRM Contact | Name, Email, Phone, etc. |
| Salesperson/Purchaser | CRM Systemuser | Name, Email, etc. |
| Opportunity | CRM Opportunity | Description, Amount, etc. |
| Item | CRM Product | Name, Description, Unit, etc. |

You only add **extra** field mappings for custom Dataverse fields (e.g., `bcs_countryid` on Product).

**What you do NOT need:**
- `OnGetCDSTableNo` — base app already maps Customer ↔ CRM Account
- `OnLookupCRMTables` — base app already handles lookups
- `OnAddEntityTableMapping` — base app already registers the entity
- `OnAfterResetConfiguration` — base app already creates the table mapping
- `LookupCDS{Entity}` — base app provides the standard lookup pages

**What you DO need:**
1. Table extension on the standard BC table (to add the custom field)
2. Extra field mapping in `AddNewExtraFieldMappings` (to sync the new field)
3. Page extension on the standard BC page (to expose the new field)

---

## Working Example: Item ↔ CRM Product with bcs_countryid

This example shows mapping a custom `bcs_countryid` field from Dataverse Product to BC Item.

### Step 1: Table Extension

**File:** `src/Table Extension/BCSItem.TableExtExt.al`

```al
tableextension 70000 "BCS Item" extends Item
{
    fields
    {
        field(70000; "BCS bcs_countryid"; Guid)
        {
            Caption = 'BCS bcs_countryid';
            DataClassification = ToBeClassified;
        }
    }
}
```

**Key points:**
- Field ID must be in the extension's ID range (from `app.json` idRanges)
- Field name uses `BCS` prefix to avoid collisions
- `DataClassification` is required for GDPR compliance
- The field type must match the Dataverse field type (Guid for lookups, Text for strings, etc.)

### Step 2: Extra Field Mapping

**File:** `src/Codeunit/BCSDataverseSupportFunct.Codeunit.al`

**Location:** Inside the `AddNewExtraFieldMappings` procedure, under the `Database::Item` case.

```al
Database::Item:
    begin
        if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Product" then
            exit;
        // Map custom bcs_countryid field from Dataverse Product to BC Item
        InsertIntegrationFieldMapping(
            IntegrationTableMapping.Name,
            Item.FieldNo("BCS bcs_countryid"),
            TempCRMProduct.FieldNo("BCS bcs_countryid"),
            IntegrationFieldMapping.Direction::Bidirectional, '', true, false);
    end;
```

**Critical: CRM table guard**

Always include the guard clause:
```al
if IntegrationTableMapping."Integration Table ID" <> Database::"CRM {Entity}" then
    exit;
```

This prevents the mapping from applying to the wrong integration table. For example, both Customer and Vendor map to CRM Account, so without the guard you could accidentally add Customer field mappings when processing the Vendor mapping.

### Step 3: Page Extension

**File:** `src/Page Extension/BCSItemCard.PageExtExt.al`

```al
pageextension 70000 "BCS Item Card" extends "Item Card"
{
    layout
    {
        addafter(Item)
        {
            group("BCS Custom fields")
            {
                Caption = 'custom fields';

                field("BCS bcs_countryid"; Rec."BCS bcs_countryid")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the country for the product.';
                }
            }
        }
    }
}
```

---

## Full AddNewExtraFieldMappings Procedure Structure

The procedure uses a `case` statement on `IntegrationTableMapping."Table ID"` to route to the correct standard BC table:

```al
internal procedure AddNewExtraFieldMappings(IntegrationTableMapping: Record "Integration Table Mapping")
var
    IntegrationFieldMapping: Record "Integration Field Mapping";
    Customer: Record Customer;
    Vendor: Record Vendor;
    Contact: Record Contact;
    SalespersonPurchaser: Record "Salesperson/Purchaser";
    Opportunity: Record Opportunity;
    Item: Record Item;
    TempCRMAccount: Record "CRM Account" temporary;
    TempCRMContact: Record "CRM Contact" temporary;
    TempCRMSystemUser: Record "CRM Systemuser" temporary;
    TempCRMOpportunity: Record "CRM Opportunity" temporary;
    TempCRMProduct: Record "CRM Product" temporary;
begin
    case IntegrationTableMapping."Table ID" of
        Database::Customer:
            begin
                if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Account" then
                    exit;
                // Add custom Customer → CRM Account field mappings here
            end;
        Database::Vendor:
            begin
                if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Account" then
                    exit;
                // Add custom Vendor → CRM Account field mappings here
            end;
        Database::Contact:
            begin
                if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Contact" then
                    exit;
                // Add custom Contact → CRM Contact field mappings here
            end;
        Database::"Salesperson/Purchaser":
            begin
                if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Systemuser" then
                    exit;
                // Add custom Salesperson → CRM Systemuser field mappings here
            end;
        Database::Opportunity:
            begin
                if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Opportunity" then
                    exit;
                // Add custom Opportunity → CRM Opportunity field mappings here
            end;
        Database::Item:
            begin
                if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Product" then
                    exit;
                // Add custom Item → CRM Product field mappings here
                InsertIntegrationFieldMapping(
                    IntegrationTableMapping.Name,
                    Item.FieldNo("BCS bcs_countryid"),
                    TempCRMProduct.FieldNo("BCS bcs_countryid"),
                    IntegrationFieldMapping.Direction::Bidirectional, '', true, false);
            end;
    end;
end;
```

**Key differences from custom entity path:**
- Uses `IntegrationTableMapping.Name` (not a custom label) — the mapping name comes from the base application
- Uses `temporary` record variables for CRM tables — no actual data access, just for `FieldNo()` references
- The event `OnAfterAddExtraIntegrationFieldMappings` already iterates through all mappings and calls this procedure — you only need to add the field mapping call

---

## Common OOB Mapping Scenarios

### Customer → CRM Account: Additional fields

```al
Database::Customer:
    begin
        if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Account" then
            exit;
        InsertIntegrationFieldMapping(
            IntegrationTableMapping.Name,
            Customer.FieldNo("No."),
            TempCRMAccount.FieldNo(AccountNumber),
            IntegrationFieldMapping.Direction::ToIntegrationTable, '', true, false);
        InsertIntegrationFieldMapping(
            IntegrationTableMapping.Name,
            Customer.FieldNo("Mobile Phone No."),
            TempCRMAccount.FieldNo(Telephone2),
            IntegrationFieldMapping.Direction::Bidirectional, '', true, false);
    end;
```

### Contact → CRM Contact: Additional fields

```al
Database::Contact:
    begin
        if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Contact" then
            exit;
        InsertIntegrationFieldMapping(
            IntegrationTableMapping.Name,
            Contact.FieldNo("Salutation Code"),
            TempCRMContact.FieldNo(Salutation),
            IntegrationFieldMapping.Direction::Bidirectional, '', true, false);
    end;
```

### Salesperson → CRM Systemuser: Additional fields

```al
Database::"Salesperson/Purchaser":
    begin
        if IntegrationTableMapping."Integration Table ID" <> Database::"CRM Systemuser" then
            exit;
        InsertIntegrationFieldMapping(
            IntegrationTableMapping.Name,
            SalespersonPurchaser.FieldNo("Job Title"),
            TempCRMSystemUser.FieldNo(JobTitle),
            IntegrationFieldMapping.Direction::Bidirectional, '', true, false);
    end;
```

---

## When OOB Fields Don't Exist on the CRM Table

If you need to map a custom Dataverse field that doesn't exist on the standard CRM table (e.g., `CRM Product` doesn't have `bcs_countryid`), you may also need a **CDS table extension**:

```al
tableextension 70001 "BCS CRM Product" extends "CRM Product"
{
    fields
    {
        field(70000; "BCS bcs_countryid"; Guid)
        {
            ExternalName = 'bcs_countryid';
            ExternalType = 'Lookup';
            Caption = 'Country';
            Description = 'Country lookup from Dataverse';
        }
    }
}
```

**This is needed when:**
- The Dataverse entity has custom fields added (bcs_ prefix columns on standard entities)
- The base CRM table in BC doesn't include those custom columns
- The ALTPGen tool was NOT used to regenerate the CRM table (which would include new fields)

**This is NOT needed when:**
- You are mapping fields that already exist on the standard CRM table (e.g., `AccountNumber` on CRM Account)
- The CRM table was regenerated with ALTPGen and already includes the custom field

---

## Duplicate Mapping Protection

The `InsertIntegrationFieldMapping` procedure includes automatic duplicate prevention via the `IsNewTableMapping` check. This is **especially critical for OOB entities** because:

1. Base application already created many field mappings
2. You're adding **extra** mappings for custom fields
3. Running "Reset Configuration" multiple times should be safe

### How IsNewTableMapping Works

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

The procedure checks if a mapping already exists for:
- The same integration table mapping (e.g., CUSTOMER-ACCOUNT)
- The same BC field number
- The same CRM field number

If the mapping exists, `InsertIntegrationFieldMapping` silently skips creation.

### Why this matters for OOB entities

**Scenario:** Adding `bcs_countryid` field to Item ↔ CRM Product

| Action | Without Check | With Check |
|--------|--------------|-----------|
| 1st Reset Config | Adds bcs_countryid mapping ✓ | Adds bcs_countryid mapping ✓ |
| 2nd Reset Config | Error: duplicate ✗ | Skips existing ✓ |
| Base app field collision | Error if field already mapped ✗ | Skips, no error ✓ |

### Checking existing base app mappings

Before adding an extra field mapping, verify it doesn't already exist in the base application:

1. Open **CDS Connection Setup**
2. Click **Integration Table Mappings**
3. Filter to your entity (e.g., ITEM-PRODUCT)
4. Click **Fields** to see existing field mappings
5. Verify your custom field is NOT already listed

If the field is already mapped by the base application, **do not add it again** — the duplicate check will skip it anyway, but it's good practice to verify first.

---

## Duplicate Mapping Warning

When mapping extra fields for OOB entities, add a comment warning about duplicates:

```al
// WARNING: Do not duplicate existing standard mappings.
// Only add mappings for fields NOT already mapped by the base application.
// Check CDS Connection Setup → Integration Table Mappings to verify existing field mappings.
```

The base application already maps many fields. Adding a duplicate mapping causes sync errors.
