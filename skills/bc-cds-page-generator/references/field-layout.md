# CDS Page Field Layout Patterns

Complete field organization patterns for Business Central CDS list pages.

## Layout Structure

```al
layout
{
    area(Content)
    {
        repeater(General)
        {
            // 1. Primary identification fields (visible)
            field(primaryfield; Rec.primaryfield)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies...';
                Caption = '...';
            }
            
            // 2. Important business fields (visible)
            field(businessfield; Rec.businessfield)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies...';
                Caption = '...';
            }
            
            // 3. Additional fields (Visible = false)
            field(additionalfield; Rec.additionalfield)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies...';
                Caption = '...';
                Visible = false;
            }
            
            // 4. System fields (Visible = false)
            field(CreatedOn; Rec.CreatedOn)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Created On field.';
                Visible = false;
            }
            
            field(ModifiedOn; Rec.ModifiedOn)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Modified On field.';
                Visible = false;
            }
            
            field(statecode; Rec.statecode)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Status field.';
                Visible = false;
            }
            
            field(statuscode; Rec.statuscode)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Status Reason field.';
                Visible = false;
            }
            
            field(SystemId; Rec.SystemId)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the SystemId field.';
                Visible = false;
            }
        }
    }
}
```

## Field Organization Principles

### 1. Primary Identification Fields (Always Visible)

**Show first:**
- Code fields (e.g., `bcs_countrycode`, `bcs_departmentcode`)
- Number fields (e.g., `AccountNumber`, `ContactNumber`)
- Name fields (e.g., `bcs_countryname`, `Name`)
- Primary identifiers specific to entity

**Example (Country):**
```al
field(bcs_countrycode; Rec.bcs_countrycode)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the two-letter country code.';
    Caption = 'Code';
}
field(bcs_countryname; Rec.bcs_countryname)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the name of the country.';
    Caption = 'Name';
}
```

### 2. Important Business Fields (Visible by Default)

**Show after primary fields:**
- Key classification fields (e.g., ISO codes, categories)
- Important status/type indicators
- Key reference fields

**Example (Country):**
```al
field(bcs_isocountrycode; Rec.bcs_isocountrycode)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the ISO 3166-1 alpha-2 country code.';
    Caption = 'ISO Code';
}
field(bcs_isocountrycode3; Rec.bcs_isocountrycode3)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the ISO 3166-1 alpha-3 country code.';
    Caption = 'ISO Code 3';
}
```

### 3. Additional Business Fields (Hidden by Default)

**Hide but available:**
- Supplementary information fields
- Fields used occasionally
- GUID reference fields
- Supporting data

**Example:**
```al
field(bcs_addressformatid; Rec.bcs_addressformatid)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the Address Format field.';
    Caption = 'Address Format';
    Visible = false;
}
field(bcs_intrastatcode; Rec.bcs_intrastatcode)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the Intrastat Code field.';
    Caption = 'Intrastat Code';
    Visible = false;
}
```

### 4. System Fields (Always Hidden)

**Always include but hide:**
- `CreatedOn`: Record creation timestamp
- `ModifiedOn`: Last modification timestamp
- `statecode`: Entity lifecycle state
- `statuscode`: Status reason
- `SystemId`: System identifier GUID

**Standard implementation:**
```al
field(CreatedOn; Rec.CreatedOn)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the Created On field.';
    Visible = false;
}
field(ModifiedOn; Rec.ModifiedOn)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the Modified On field.';
    Visible = false;
}
field(statecode; Rec.statecode)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the Status field.';
    Visible = false;
}
field(statuscode; Rec.statuscode)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the Status Reason field.';
    Visible = false;
}
field(SystemId; Rec.SystemId)
{
    ApplicationArea = All;
    ToolTip = 'Specifies the value of the SystemId field.';
    Visible = false;
}
```

## Field Visibility Strategy

### Master Data Entities

**Example entities:** Country, Currency, Legal Entity, Department

**Show (3-5 fields):**
- Code
- Name
- Primary classification (ISO code, category)
- Key attributes

**Hide:**
- All supplementary fields
- All system fields
- GUID references

### Transactional Entities

**Example entities:** Order, Invoice, Timesheet Entry

**Show (4-6 fields):**
- Document number
- Date
- Customer/Vendor name
- Amount
- Status

**Hide:**
- Line details
- Technical fields
- System fields

### Standard CRM Entities

**Example entities:** Account, Contact, Product

**Show (3-5 fields):**
- Number/Code
- Name
- Type/Category
- Key identifier

**Hide:**
- Extended attributes
- Related party fields
- System fields

## ToolTip Guidelines

### Format Rules

1. **Start with "Specifies"**
   - Standard: `'Specifies the two-letter country code.'`
   - Generic: `'Specifies the value of the [Field Name] field.'`

2. **Be specific when possible**
   - Good: `'Specifies the ISO 3166-1 alpha-2 country code.'`
   - Generic: `'Specifies the value of the ISO Code field.'`

3. **End with period**
   - Always include ending punctuation

### Example ToolTips

**Primary fields:**
```al
ToolTip = 'Specifies the two-letter country code.';
ToolTip = 'Specifies the name of the country.';
ToolTip = 'Specifies the department identification code.';
```

**Classification fields:**
```al
ToolTip = 'Specifies the ISO 3166-1 alpha-2 country code.';
ToolTip = 'Specifies the ISO 3166-1 alpha-3 country code.';
ToolTip = 'Specifies the address format used in this country.';
```

**Generic fallback:**
```al
ToolTip = 'Specifies the value of the [Field Name] field.';
```

## Field Ordering Template

Use this order for all CDS list pages:

```
1. Primary Code/Number (visible)
2. Primary Name (visible)
3. Secondary Code (visible if key identifier)
4. Key Classification Fields (visible, 1-3 fields)
5. ───────────────────────────
6. Supplementary Business Fields (hidden)
7. Reference GUID Fields (hidden)
8. ───────────────────────────
9. CreatedOn (hidden)
10. ModifiedOn (hidden)
11. statecode (hidden)
12. statuscode (hidden)
13. SystemId (hidden)
```

## Complete Example: Department Page

```al
layout
{
    area(Content)
    {
        repeater(General)
        {
            // 1. Primary identification
            field(bcs_departmentcode; Rec.bcs_departmentcode)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the department code.';
                Caption = 'Code';
            }
            
            field(bcs_name; Rec.bcs_name)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the department name.';
                Caption = 'Name';
            }
            
            // 2. Key business fields
            field(bcs_description; Rec.bcs_description)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the department description.';
                Caption = 'Description';
            }
            
            // 3. Reference fields (hidden)
            field(bcs_legalentityid; Rec.bcs_legalentityid)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Legal Entity field.';
                Caption = 'Legal Entity';
                Visible = false;
            }
            
            // 4. System fields (always hidden)
            field(CreatedOn; Rec.CreatedOn)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Created On field.';
                Visible = false;
            }
            
            field(ModifiedOn; Rec.ModifiedOn)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Modified On field.';
                Visible = false;
            }
            
            field(statecode; Rec.statecode)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Status field.';
                Visible = false;
            }
            
            field(statuscode; Rec.statuscode)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the Status Reason field.';
                Visible = false;
            }
            
            field(SystemId; Rec.SystemId)
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the value of the SystemId field.';
                Visible = false;
            }
        }
    }
}
```

## Troubleshooting Field Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Field not found error | Case-sensitive mismatch | Verify exact field name from table definition |
| Field doesn't display | Data source issue | Check CDS table has data, verify connection |
| ToolTip missing | Compilation warning | Add ToolTip property to all fields |
| Too many visible fields | Cluttered UI | Hide supplementary fields, show only 3-5 key fields |
| Wrong field order | Poor organization | Follow template order: Code, Name, Key Fields, Hidden Fields, System Fields |
