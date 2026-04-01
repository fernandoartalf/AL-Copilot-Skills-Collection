# Standard Components for CDS List Pages

Complete implementations of actions, triggers, and procedures required for Business Central CDS list pages.

## Required Components

Every CDS list page must include:
1. **CreateFromCDS Action** — creates BC records from Dataverse records
2. **OnInit Trigger** — initializes CRM integration
3. **SetCurrentlyCoupled[Entity] Procedure** — tracks coupled records in lookup scenarios

---

## 1. CreateFromCDS Action

### Purpose

Allows users to create Business Central records from selected Dataverse records using the standard synchronization mechanism.

### Standard Implementation

```al
actions
{
    area(processing)
    {
        action(CreateFromCDS)
        {
            ApplicationArea = All;
            Caption = 'Create in Business Central';
            Promoted = true;
            PromotedCategory = Process;
            ToolTip = 'Generate the record from the coupled Microsoft Dataverse [entity].';

            trigger OnAction()
            var
                CDSEntity: Record "BCS CDS [tablename]";
                CRMIntegrationManagement: Codeunit "CRM Integration Management";
            begin
                CurrPage.SetSelectionFilter(CDSEntity);
                CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSEntity);
            end;
        }
    }
}
```

### Customization Steps

1. **Replace `[entity]` in ToolTip** with lowercase entity name:
   - Countries: `'Generate the record from the coupled Microsoft Dataverse country.'`
   - Departments: `'Generate the record from the coupled Microsoft Dataverse department.'`
   - Legal Entities: `'Generate the record from the coupled Microsoft Dataverse legal entity.'`

2. **Replace `[tablename]` in Record variable** with actual CDS table name:
   - `Record "BCS CDS bcs_country"`
   - `Record "BCS CDS bcs_department"`
   - `Record "BCS CDS bcs_legalentity"`

3. **Update variable name** to match entity:
   - `CDSCountry: Record "BCS CDS bcs_country"`
   - `CDSDepartment: Record "BCS CDS bcs_department"`
   - `CDSLegalEntity: Record "BCS CDS bcs_legalentity"`

### Complete Examples

**Country:**
```al
action(CreateFromCDS)
{
    ApplicationArea = All;
    Caption = 'Create in Business Central';
    Promoted = true;
    PromotedCategory = Process;
    ToolTip = 'Generate the record from the coupled Microsoft Dataverse country.';

    trigger OnAction()
    var
        CDSCountry: Record "BCS CDS bcs_country";
        CRMIntegrationManagement: Codeunit "CRM Integration Management";
    begin
        CurrPage.SetSelectionFilter(CDSCountry);
        CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSCountry);
    end;
}
```

**Department:**
```al
action(CreateFromCDS)
{
    ApplicationArea = All;
    Caption = 'Create in Business Central';
    Promoted = true;
    PromotedCategory = Process;
    ToolTip = 'Generate the record from the coupled Microsoft Dataverse department.';

    trigger OnAction()
    var
        CDSDepartment: Record "BCS CDS bcs_department";
        CRMIntegrationManagement: Codeunit "CRM Integration Management";
    begin
        CurrPage.SetSelectionFilter(CDSDepartment);
        CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSDepartment);
    end;
}
```

**Legal Entity:**
```al
action(CreateFromCDS)
{
    ApplicationArea = All;
    Caption = 'Create in Business Central';
    Promoted = true;
    PromotedCategory = Process;
    ToolTip = 'Generate the record from the coupled Microsoft Dataverse legal entity.';

    trigger OnAction()
    var
        CDSLegalEntity: Record "BCS CDS bcs_legalentity";
        CRMIntegrationManagement: Codeunit "CRM Integration Management";
    begin
        CurrPage.SetSelectionFilter(CDSLegalEntity);
        CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSLegalEntity);
    end;
}
```

---

## 2. OnInit Trigger

### Purpose

Initializes the CRM Integration Management codeunit when the page opens, ensuring proper Dataverse connection and synchronization capabilities.

### Standard Implementation

```al
trigger OnInit()
begin
    Codeunit.Run(Codeunit::"CRM Integration Management");
end;
```

### Implementation Notes

- **No customization needed** — use exactly as shown
- Required for all CDS list pages
- Placed after `actions` section, before procedures
- Runs once when page is initialized

### Complete Page Context

```al
page 70004 "BCS CDS Countries"
{
    // ... properties ...
    
    layout
    {
        // ... fields ...
    }
    
    actions
    {
        // ... CreateFromCDS action ...
    }
    
    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;
    
    // ... procedures ...
}
```

---

## 3. SetCurrentlyCoupled[Entity] Procedure

### Purpose

Tracks the currently coupled Dataverse record when the page is opened as a lookup during coupling operations.

### Standard Implementation

```al
/// <summary>
/// Sets the currently coupled [entity] record in the lookup page.
/// </summary>
/// <param name="[Entity]">The [entity] record that is currently coupled.</param>
procedure SetCurrentlyCoupled[Entity]([Entity]: Record "BCS CDS [tablename]")
begin
    CurrentlyCoupled[Entity] := [Entity];
end;

var
    CurrentlyCoupled[Entity]: Record "BCS CDS [tablename]";
```

### Customization Steps

1. **Replace `[Entity]` in procedure name** with entity name:
   - `SetCurrentlyCoupledCountry`
   - `SetCurrentlyCoupledDepartment`
   - `SetCurrentlyCoupledLegalEntity`

2. **Replace `[entity]` in XML comments** with lowercase entity name:
   - `/// Sets the currently coupled country record in the lookup page.`
   - `/// Sets the currently coupled department record in the lookup page.`

3. **Replace `[Entity]` in parameter name** with entity name:
   - `Country: Record "BCS CDS bcs_country"`
   - `Department: Record "BCS CDS bcs_department"`

4. **Replace variable name** to match entity:
   - `CurrentlyCoupledCountry: Record "BCS CDS bcs_country"`
   - `CurrentlyCoupledDepartment: Record "BCS CDS bcs_department"`

### Complete Examples

**Country:**
```al
/// <summary>
/// Sets the currently coupled country record in the lookup page.
/// </summary>
/// <param name="Country">The country record that is currently coupled.</param>
procedure SetCurrentlyCoupledCountry(Country: Record "BCS CDS bcs_country")
begin
    CurrentlyCoupledCountry := Country;
end;

var
    CurrentlyCoupledCountry: Record "BCS CDS bcs_country";
```

**Department:**
```al
/// <summary>
/// Sets the currently coupled department record in the lookup page.
/// </summary>
/// <param name="Department">The department record that is currently coupled.</param>
procedure SetCurrentlyCoupledDepartment(Department: Record "BCS CDS bcs_department")
begin
    CurrentlyCoupledDepartment := Department;
end;

var
    CurrentlyCoupledDepartment: Record "BCS CDS bcs_department";
```

**Legal Entity:**
```al
/// <summary>
/// Sets the currently coupled legal entity record in the lookup page.
/// </summary>
/// <param name="LegalEntity">The legal entity record that is currently coupled.</param>
procedure SetCurrentlyCoupledLegalEntity(LegalEntity: Record "BCS CDS bcs_legalentity")
begin
    CurrentlyCoupledLegalEntity := LegalEntity;
end;

var
    CurrentlyCoupledLegalEntity: Record "BCS CDS bcs_legalentity";
```

---

## Complete Page Template

### Minimal Working Page

```al
page [ID] "BCS CDS [EntityName]"
{
    ApplicationArea = All;
    Caption = 'Dataverse [EntityName]';
    PageType = List;
    SourceTable = "BCS CDS [tablename]";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // ... fields ...
            }
        }
    }

    actions
    {
        area(processing)
        {
            action(CreateFromCDS)
            {
                ApplicationArea = All;
                Caption = 'Create in Business Central';
                Promoted = true;
                PromotedCategory = Process;
                ToolTip = 'Generate the record from the coupled Microsoft Dataverse [entity].';

                trigger OnAction()
                var
                    CDSEntity: Record "BCS CDS [tablename]";
                    CRMIntegrationManagement: Codeunit "CRM Integration Management";
                begin
                    CurrPage.SetSelectionFilter(CDSEntity);
                    CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSEntity);
                end;
            }
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

    /// <summary>
    /// Sets the currently coupled [entity] record in the lookup page.
    /// </summary>
    /// <param name="[Entity]">The [entity] record that is currently coupled.</param>
    procedure SetCurrentlyCoupled[Entity]([Entity]: Record "BCS CDS [tablename]")
    begin
        CurrentlyCoupled[Entity] := [Entity];
    end;

    var
        CurrentlyCoupled[Entity]: Record "BCS CDS [tablename]";
}
```

---

## Component Checklist

When creating a CDS list page, verify:

- [ ] **CreateFromCDS action** included in `actions` section
- [ ] Action ToolTip references correct entity name
- [ ] Action variable name matches entity (CDSCountry, CDSDepartment)
- [ ] Action variable Record type matches CDS table name
- [ ] **OnInit trigger** present after actions section
- [ ] OnInit trigger runs CRM Integration Management codeunit
- [ ] **SetCurrentlyCoupled[Entity] procedure** defined
- [ ] Procedure name matches entity
- [ ] Procedure parameter matches entity and table
- [ ] XML documentation comments updated
- [ ] Global variable declared for CurrentlyCoupled[Entity]

---

## Troubleshooting Component Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| CreateFromCDS action fails | CRM Integration not initialized | Verify OnInit trigger present and runs CRM Integration Management |
| Variable not found error | Mismatched entity name | Update variable name to match entity (e.g., CDSCountry) |
| Procedure name conflict | Generic naming | Use specific entity name in SetCurrentlyCoupled[Entity] |
| Record type mismatch | Wrong table reference | Verify Record variable references correct CDS table |
| Action not visible | Missing promotion | Ensure `Promoted = true` and `PromotedCategory = Process` |
| ToolTip compilation warning | Generic tooltip | Replace `[entity]` with actual entity name in lowercase |

---

## Advanced Customization

### Additional Actions

For specific scenarios, you can add:

**Refresh Action:**
```al
action(RefreshFromCDS)
{
    ApplicationArea = All;
    Caption = 'Refresh from Dataverse';
    Image = Refresh;
    Promoted = true;
    PromotedCategory = Process;
    ToolTip = 'Refresh the data from Microsoft Dataverse.';

    trigger OnAction()
    begin
        CurrPage.Update(false);
    end;
}
```

**Couple Action:**
```al
action(ManageCRMCoupling)
{
    ApplicationArea = All;
    Caption = 'Coupling';
    Image = LinkAccount;
    Promoted = true;
    PromotedCategory = Process;
    ToolTip = 'Create or modify the coupling to a Microsoft Dataverse record.';

    trigger OnAction()
    var
        CRMIntegrationManagement: Codeunit "CRM Integration Management";
    begin
        CRMIntegrationManagement.DefineCoupling(Rec.RecordId);
    end;
}
```

### Additional Triggers

**OnOpenPage for filtering:**
```al
trigger OnOpenPage()
begin
    Rec.SetRange(statecode, Rec.statecode::Active);
end;
```

### Additional Procedures

**Filtering helper:**
```al
procedure ShowActiveOnly()
begin
    Rec.SetRange(statecode, Rec.statecode::Active);
    CurrPage.Update(false);
end;

procedure ShowAll()
begin
    Rec.SetRange(statecode);
    CurrPage.Update(false);
end;
```
