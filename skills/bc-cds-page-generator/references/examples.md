# CDS Page Generation Examples

Complete working examples of CDS list pages for various entity types.

> **Important:** These examples use **"BCS"** as the author prefix. When implementing in your project, replace "BCS" with your organization's prefix (e.g., "ABC", "XYZ", "COMP") throughout:
> - Table names: `"BCS CDS bcs_country"` → `"[PREFIX] CDS bcs_country"`
> - Page names: `"BCS CDS Countries"` → `"[PREFIX] CDS Countries"`
> - File names: `BCSCDSCountries.Page.al` → `[PREFIX]CDSCountries.Page.al`

---

## Example 1: Master Data — Country Page

**Scenario:** Reference entity with code, name, and ISO classification fields.

**Request:**
```
"Create a list page for the BCS CDS bcs_country table"
```

**Context:**
- CDS table exists: `"BCS CDS bcs_country"`
- Fields: `bcs_countrycode`, `bcs_countryname`, `bcs_isoalpha2code`, etc.
- Next available page ID: 70004
- Pattern: Master data (code + name + key attributes)

**Generated Page:**
```al
page 70004 "BCS CDS Countries"
{
    ApplicationArea = All;
    Caption = 'Dataverse Countries';
    PageType = List;
    SourceTable = "BCS CDS bcs_country";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Primary identification (visible)
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
                
                field(bcs_isoalpha2code; Rec.bcs_isoalpha2code)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the ISO Alpha-2 code for the country.';
                    Caption = 'ISO Code';
                }
                
                // System fields (hidden)
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
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

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
}
```

**File saved as:** `src/Page/BCSCDSCountries.Page.al`

**Key features:**
- 3 visible fields (code, name, ISO code)
- All system fields hidden
- Standard CreateFromCDS action
- Coupling procedure for lookup scenarios

---

## Example 2: Standard CRM Entity — Account Page

**Scenario:** Standard Dataverse Account entity with number, name, type, contact fields.

**Request:**
```
"Generate a Dataverse page for Account CDS table showing account number, name, and type"
```

**Context:**
- CDS table: `"BCS CDS Account"`
- Key fields: `accountnumber`, `name`, `accounttype`
- Page ID: 70010
- Pattern: Transactional entity with extended fields

**Generated Page:**
```al
page 70010 "BCS CDS Accounts"
{
    ApplicationArea = All;
    Caption = 'Dataverse Accounts';
    PageType = List;
    SourceTable = "BCS CDS Account";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Primary identification (visible)
                field(accountnumber; Rec.accountnumber)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the account number.';
                    Caption = 'Account No.';
                }
                
                field(name; Rec.name)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name of the account.';
                    Caption = 'Name';
                }
                
                field(accounttype; Rec.accounttype)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the type of account.';
                    Caption = 'Type';
                }
                
                field(emailaddress1; Rec.emailaddress1)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the primary email address.';
                    Caption = 'Email';
                }
                
                // Supplementary fields (hidden)
                field(telephone1; Rec.telephone1)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the main phone number.';
                    Caption = 'Phone';
                    Visible = false;
                }
                
                // System fields (hidden)
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
                ToolTip = 'Generate the record from the coupled Microsoft Dataverse account.';

                trigger OnAction()
                var
                    CDSAccount: Record "BCS CDS Account";
                    CRMIntegrationManagement: Codeunit "CRM Integration Management";
                begin
                    CurrPage.SetSelectionFilter(CDSAccount);
                    CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSAccount);
                end;
            }
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

    /// <summary>
    /// Sets the currently coupled account record in the lookup page.
    /// </summary>
    /// <param name="Account">The account record that is currently coupled.</param>
    procedure SetCurrentlyCoupledAccount(Account: Record "BCS CDS Account")
    begin
        CurrentlyCoupledAccount := Account;
    end;

    var
        CurrentlyCoupledAccount: Record "BCS CDS Account";
}
```

**File saved as:** `src/Page/BCSCDSAccounts.Page.al`

**Key features:**
- 4 visible fields (number, name, type, email)
- Phone field hidden but available
- Standard pattern for CRM entities

---

## Example 3: Custom Visibility — Department Page

**Scenario:** Custom entity with explicit field visibility control.

**Request:**
```
"Create a list page for BCS CDS bcs_department showing department code, name, and manager, but hide all timestamps"
```

**Generated Page:**
```al
page 70015 "BCS CDS Departments"
{
    ApplicationArea = All;
    Caption = 'Dataverse Departments';
    PageType = List;
    SourceTable = "BCS CDS bcs_department";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Primary identification (visible)
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
                
                field(bcs_manager; Rec.bcs_manager)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the department manager.';
                    Caption = 'Manager';
                }
                
                // Timestamps explicitly hidden per request
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
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

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
}
```

**File saved as:** `src/Page/BCSCDSDepartments.Page.al`

**Key features:**
- Explicit visibility control per user request
- 3 visible fields as specified
- All system fields hidden

---

## Example 4: Option Sets — Product Page

**Scenario:** Entity with enum/option set fields for classification.

**Request:**
```
"Build a list page for Product CDS table with product number, name, and price, showing the product type option set"
```

**Generated Page:**
```al
page 70020 "BCS CDS Products"
{
    ApplicationArea = All;
    Caption = 'Dataverse Products';
    PageType = List;
    SourceTable = "BCS CDS Product";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Primary identification (visible)
                field(productnumber; Rec.productnumber)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the product number.';
                    Caption = 'Product No.';
                }
                
                field(name; Rec.name)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the product name.';
                    Caption = 'Name';
                }
                
                field(price; Rec.price)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the product price.';
                    Caption = 'Price';
                }
                
                // Option set field (visible)
                field(producttypecode; Rec.producttypecode)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the product type.';
                    Caption = 'Type';
                }
                
                // Supplementary fields (hidden)
                field(description; Rec.description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the product description.';
                    Caption = 'Description';
                    Visible = false;
                }
                
                // System fields (hidden)
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
                ToolTip = 'Generate the record from the coupled Microsoft Dataverse product.';

                trigger OnAction()
                var
                    CDSProduct: Record "BCS CDS Product";
                    CRMIntegrationManagement: Codeunit "CRM Integration Management";
                begin
                    CurrPage.SetSelectionFilter(CDSProduct);
                    CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSProduct);
                end;
            }
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

    /// <summary>
    /// Sets the currently coupled product record in the lookup page.
    /// </summary>
    /// <param name="Product">The product record that is currently coupled.</param>
    procedure SetCurrentlyCoupledProduct(Product: Record "BCS CDS Product")
    begin
        CurrentlyCoupledProduct := Product;
    end;

    var
        CurrentlyCoupledProduct: Record "BCS CDS Product";
}
```

**File saved as:** `src/Page/BCSCDSProducts.Page.al`

**Key features:**
- Option set field (producttypecode) visible
- 4 visible fields (number, name, price, type)
- Description field hidden

---

## Example 5: Extended Actions — Contact Page with Custom Sync

**Scenario:** Standard page with additional custom action for field synchronization.

**Request:**
```
"Generate a Contact page with an additional action to sync email addresses back to Business Central"
```

**Generated Page:**
```al
page 70025 "BCS CDS Contacts"
{
    ApplicationArea = All;
    Caption = 'Dataverse Contacts';
    PageType = List;
    SourceTable = "BCS CDS Contact";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Primary identification (visible)
                field(fullname; Rec.fullname)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the full name of the contact.';
                    Caption = 'Name';
                }
                
                field(emailaddress1; Rec.emailaddress1)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the primary email address.';
                    Caption = 'Email';
                }
                
                field(telephone1; Rec.telephone1)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the business phone number.';
                    Caption = 'Phone';
                }
                
                // Supplementary fields (hidden)
                field(jobtitle; Rec.jobtitle)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the job title.';
                    Caption = 'Job Title';
                    Visible = false;
                }
                
                // System fields (hidden)
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

    actions
    {
        area(processing)
        {
            // Standard action
            action(CreateFromCDS)
            {
                ApplicationArea = All;
                Caption = 'Create in Business Central';
                Promoted = true;
                PromotedCategory = Process;
                ToolTip = 'Generate the record from the coupled Microsoft Dataverse contact.';

                trigger OnAction()
                var
                    CDSContact: Record "BCS CDS Contact";
                    CRMIntegrationManagement: Codeunit "CRM Integration Management";
                begin
                    CurrPage.SetSelectionFilter(CDSContact);
                    CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSContact);
                end;
            }
            
            // Custom action for email synchronization
            action(SyncEmail)
            {
                ApplicationArea = All;
                Caption = 'Sync Email Addresses';
                Promoted = true;
                PromotedCategory = Process;
                ToolTip = 'Synchronize email addresses from Dataverse contacts to Business Central.';

                trigger OnAction()
                var
                    CDSContact: Record "BCS CDS Contact";
                    Contact: Record Contact;
                    CRMIntegrationRecord: Record "CRM Integration Record";
                begin
                    CurrPage.SetSelectionFilter(CDSContact);
                    if CDSContact.FindSet() then
                        repeat
                            if CRMIntegrationRecord.FindByRecordID(CDSContact.RecordId) then
                                if Contact.Get(CRMIntegrationRecord."Integration ID") then begin
                                    Contact.Validate("E-Mail", CDSContact.emailaddress1);
                                    Contact.Modify(true);
                                end;
                        until CDSContact.Next() = 0;
                    Message('Email addresses synchronized.');
                end;
            }
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

    /// <summary>
    /// Sets the currently coupled contact record in the lookup page.
    /// </summary>
    /// <param name="Contact">The contact record that is currently coupled.</param>
    procedure SetCurrentlyCoupledContact(Contact: Record "BCS CDS Contact")
    begin
        CurrentlyCoupledContact := Contact;
    end;

    var
        CurrentlyCoupledContact: Record "BCS CDS Contact";
}
```

**File saved as:** `src/Page/BCSCDSContacts.Page.al`

**Key features:**
- Standard CreateFromCDS action
- Custom SyncEmail action for bidirectional sync
- Uses CRM Integration Record table to resolve coupling
- Demonstrates advanced action pattern

---

## Example 6: Minimal Page — Simple Entity

**Scenario:** Minimal implementation with only essential fields visible.

**Request:**
```
"Create a simple page for CDS table with just ID and name fields visible"
```

**Generated Page:**
```al
page 70030 "BCS CDS Simple Entities"
{
    ApplicationArea = All;
    Caption = 'Dataverse Simple Entities';
    PageType = List;
    SourceTable = "BCS CDS SimpleEntity";
    UsageCategory = Lists;
    Editable = false;
    RefreshOnActivate = true;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                // Only essential fields visible
                field(simpleentityId; Rec.simpleentityId)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the unique identifier.';
                    Caption = 'ID';
                }
                
                field(name; Rec.name)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name.';
                    Caption = 'Name';
                }
                
                // All other fields hidden
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
                ToolTip = 'Generate the record from the coupled Microsoft Dataverse entity.';

                trigger OnAction()
                var
                    CDSSimpleEntity: Record "BCS CDS SimpleEntity";
                    CRMIntegrationManagement: Codeunit "CRM Integration Management";
                begin
                    CurrPage.SetSelectionFilter(CDSSimpleEntity);
                    CRMIntegrationManagement.CreateNewRecordsFromCRM(CDSSimpleEntity);
                end;
            }
        }
    }

    trigger OnInit()
    begin
        Codeunit.Run(Codeunit::"CRM Integration Management");
    end;

    /// <summary>
    /// Sets the currently coupled entity record in the lookup page.
    /// </summary>
    /// <param name="SimpleEntity">The simple entity record that is currently coupled.</param>
    procedure SetCurrentlyCoupledSimpleEntity(SimpleEntity: Record "BCS CDS SimpleEntity")
    begin
        CurrentlyCoupledSimpleEntity := SimpleEntity;
    end;

    var
        CurrentlyCoupledSimpleEntity: Record "BCS CDS SimpleEntity";
}
```

**File saved as:** `src/Page/BCSCDSSimpleEntities.Page.al`

**Key features:**
- Minimal visible fields (only 2)
- Clean, focused UI
- All system fields hidden

---

## Pattern Summary

| Example | Pattern Type | Visible Fields | Special Features |
|---------|-------------|---------------|------------------|
| Country | Master Data | 3 (code, name, ISO code) | Standard reference entity |
| Account | Transactional | 4 (number, name, type, email) | Standard CRM entity |
| Department | Master Data | 3 (code, name, manager) | Custom visibility control |
| Product | Master Data | 4 (number, name, price, type) | Option set field included |
| Contact | Transactional | 3 (name, email, phone) | Custom sync action |
| Simple Entity | Minimal | 2 (ID, name) | Minimal implementation |

---

## Common Adaptations

### For Your Project

When implementing these examples in your project:

1. **Replace prefix:** `"BCS CDS"` → `"[YourPrefix] CDS"`
2. **Replace file names:** `BCSCDSCountries.Page.al` → `[YourPrefix]CDSCountries.Page.al`
3. **Update page IDs:** Use your project's ID range
4. **Adjust field selection:** Show fields relevant to your scenario
5. **Update variable names:** Match your naming conventions

### Field Selection Guidelines

- **2-3 fields:** Minimal implementation, highly focused
- **3-5 fields:** Standard implementation, balanced visibility
- **5-7 fields:** Extended implementation, more information visible
- **7+ fields:** Comprehensive display (consider UX impact)

### When to Add Custom Actions

Add custom actions when:
- Bidirectional sync needed (like SyncEmail example)
- Bulk operations required
- Special business logic applies
- User convenience features needed

For most scenarios, the standard CreateFromCDS action is sufficient.
