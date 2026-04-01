# Advanced Setup Table Patterns

This file contains advanced patterns and variations for setup tables not included in the main SKILL.md to keep it concise.

## Multi-Company Setup Patterns

### Pattern 1: Shared Setup Across Companies

For settings that should be shared across all companies (tenant-wide):

```al
table [ID] "[Prefix] Tenant Setup"
{
  Caption = '[Module] Tenant Setup';
  DataPerCompany = false;  // ← Key difference
  DataClassification = CustomerContent;
  
  fields
  {
    field(1; "Primary Key"; Code[10])
    {
      Caption = 'Primary Key';
      DataClassification = SystemMetadata;
    }
    
    field(10; "Global Setting"; Text[100])
    {
      Caption = 'Global Setting';
      DataClassification = CustomerContent;
    }
  }
  
  keys
  {
    key(PK; "Primary Key")
    {
      Clustered = true;
    }
  }
}
```

**Use Case**: License keys, global integration endpoints, shared credentials.

**Caution**: `DataPerCompany = false` means changes affect ALL companies. Use sparingly.

### Pattern 2: Per-User Setup

For user-specific preferences:

```al
table [ID] "[Prefix] User Setup"
{
  Caption = '[Module] User Setup';
  DataClassification = EndUserIdentifiableInformation;
  
  fields
  {
    field(1; "User ID"; Code[50])
    {
      Caption = 'User ID';
      DataClassification = EndUserIdentifiableInformation;
      TableRelation = User."User Name";
      NotBlank = true;
    }
    
    field(10; "Default View"; Option)
    {
      Caption = 'Default View';
      OptionMembers = List,Card,Timeline;
      OptionCaption = 'List,Card,Timeline';
      DataClassification = EndUserIdentifiableInformation;
    }
  }
  
  keys
  {
    key(PK; "User ID")
    {
      Clustered = true;
    }
  }
  
  procedure GetOrCreate()
  begin
    if not Get(UserId) then begin
      Init();
      "User ID" := CopyStr(UserId, 1, MaxStrLen("User ID"));
      Insert();
    end;
  end;
}
```

**Key Difference**: Primary key is User ID instead of fixed "Primary Key" field. NOT a singleton table.

## Advanced Field Patterns

### Option Fields with Custom Values

```al
field(20; "Processing Mode"; Option)
{
  Caption = 'Processing Mode';
  OptionMembers = Synchronous,Asynchronous,Batch;
  OptionCaption = 'Synchronous,Asynchronous,Batch';
  DataClassification = CustomerContent;
  
  trigger OnValidate()
  begin
    case "Processing Mode" of
      "Processing Mode"::Asynchronous:
        TestField("Background Job Queue Category");
      "Processing Mode"::Batch:
        begin
          TestField("Batch Size");
          TestField("Background Job Queue Category");
        end;
    end;
  end;
}
```

**Pattern**: Validate dependent fields when option changes.

### Enum Fields (Modern BC)

```al
// Define enum
enum [ID] "[Prefix] Integration Mode"
{
  Extensible = true;
  
  value(0; Disabled) { Caption = 'Disabled'; }
  value(1; ReadOnly) { Caption = 'Read Only'; }
  value(2; ReadWrite) { Caption = 'Read/Write'; }
}

// Use in setup table
field(30; "Integration Mode"; Enum "[Prefix] Integration Mode")
{
  Caption = 'Integration Mode';
  DataClassification = CustomerContent;
}
```

**Advantage**: Extensible enums allow other extensions to add values.

### Date Formula Fields

```al
field(40; "Retention Period"; DateFormula)
{
  Caption = 'Retention Period';
  DataClassification = CustomerContent;
  ToolTip = 'Specifies how long records are kept. Example: 1Y for one year.';
  
  trigger OnValidate()
  var
    TestDate: Date;
  begin
    if Format("Retention Period") = '' then
      exit;
    
    TestDate := CalcDate("Retention Period", Today);
    if TestDate < Today then
      Error('Retention period must be positive.');
  end;
}
```

### Decimal Fields with Rounding

```al
field(50; "Default Discount %"; Decimal)
{
  Caption = 'Default Discount %';
  DataClassification = CustomerContent;
  DecimalPlaces = 2 : 5;
  MinValue = 0;
  MaxValue = 100;
  
  trigger OnValidate()
  begin
    if "Default Discount %" < 0 then
      Error('Discount cannot be negative.');
    if "Default Discount %" > 100 then
      Error('Discount cannot exceed 100%%.');
  end;
}
```

## Setup Page Advanced Patterns

### Multi-Tab Setup with FastTabs

```al
page [ID] "[Prefix] Setup"
{
  PageType = Card;
  SourceTable = "[Prefix] Setup";
  
  layout
  {
    area(Content)
    {
      group(GeneralFastTab)
      {
        Caption = 'General';
        ShowCaption = true;
        
        field("Enable Feature"; Rec."Enable Feature")
        {
          ApplicationArea = All;
        }
      }
      
      group(NumberSeriesFastTab)
      {
        Caption = 'Number Series';
        ShowCaption = true;
        
        field("Document Nos."; Rec."Document Nos.")
        {
          ApplicationArea = All;
        }
      }
      
      group(IntegrationFastTab)
      {
        Caption = 'Integration';
        ShowCaption = true;
        
        field("API Base URL"; Rec."API Base URL")
        {
          ApplicationArea = All;
        }
      }
    }
  }
}
```

### Conditional Field Visibility

```al
layout
{
  area(Content)
  {
    group(General)
    {
      field("Enable Integration"; Rec."Enable Integration")
      {
        ApplicationArea = All;
      }
    }
    
    group(IntegrationSettings)
    {
      Caption = 'Integration Settings';
      Visible = Rec."Enable Integration";  // ← Conditional visibility
      
      field("API Base URL"; Rec."API Base URL")
      {
        ApplicationArea = All;
      }
      
      field("API Key"; Rec."API Key")
      {
        ApplicationArea = All;
      }
    }
  }
}
```

### Editable Field Based on Permission

```al
field("Critical Setting"; Rec."Critical Setting")
{
  ApplicationArea = All;
  Editable = IsAdmin;
}

var
  IsAdmin: Boolean;

trigger OnOpenPage()
var
  UserPermissions: Codeunit "User Permissions";
begin
  Rec.Reset();
  if not Rec.Get() then begin
    Rec.Init();
    Rec.Insert();
  end;
  
  IsAdmin := UserPermissions.IsSuper(UserSecurityId());
end;
```

## Setup Table Extension Patterns

### Extending Base Setup (General Ledger Setup)

```al
tableextension [ID] "[Prefix] G/L Setup" extends "General Ledger Setup"
{
  fields
  {
    field([ID]; "[Prefix] Enable Feature"; Boolean)
    {
      Caption = 'Enable [Feature Name]';
      DataClassification = CustomerContent;
    }
    
    field([ID+1]; "[Prefix] Default Account"; Code[20])
    {
      Caption = 'Default [Feature] Account';
      DataClassification = CustomerContent;
      TableRelation = "G/L Account";
    }
  }
}

pageextension [ID] "[Prefix] G/L Setup" extends "General Ledger Setup"
{
  layout
  {
    addlast(Content)
    {
      group("[Prefix] CustomGroup")
      {
        Caption = '[Module Name]';
        
        field("[Prefix] Enable Feature"; Rec."[Prefix] Enable Feature")
        {
          ApplicationArea = All;
          ToolTip = 'Specifies whether [feature] is enabled.';
        }
        
        field("[Prefix] Default Account"; Rec."[Prefix] Default Account")
        {
          ApplicationArea = All;
          ToolTip = 'Specifies the default G/L account for [feature].';
          Enabled = Rec."[Prefix] Enable Feature";
        }
      }
    }
  }
}
```

**Use Case**: Add module-specific settings to existing BC setup pages.

### Extending Sales & Receivables Setup

```al
tableextension [ID] "[Prefix] Sales Setup" extends "Sales & Receivables Setup"
{
  fields
  {
    field([ID]; "[Prefix] Auto Assign Salesperson"; Boolean)
    {
      Caption = 'Auto Assign Salesperson';
      DataClassification = CustomerContent;
    }
    
    field([ID+1]; "[Prefix] Default Salesperson"; Code[20])
    {
      Caption = 'Default Salesperson';
      DataClassification = CustomerContent;
      TableRelation = "Salesperson/Purchaser";
    }
  }
}

pageextension [ID] "[Prefix] Sales Setup" extends "Sales & Receivables Setup"
{
  layout
  {
    addafter("Number Series")
    {
      group("[Prefix] SalespersonGroup")
      {
        Caption = 'Salesperson Assignment';
        
        field("[Prefix] Auto Assign"; Rec."[Prefix] Auto Assign Salesperson")
        {
          ApplicationArea = All;
        }
        
        field("[Prefix] Default Salesperson"; Rec."[Prefix] Default Salesperson")
        {
          ApplicationArea = All;
          Enabled = Rec."[Prefix] Auto Assign Salesperson";
        }
      }
    }
  }
}
```

## Caching Patterns

### Advanced GetRecordOnce with Refresh

```al
table [ID] "[Prefix] Setup"
{
  // ... fields ...
  
  procedure GetRecordOnce()
  begin
    if IsInitialized then
      exit;
    
    Get();
    IsInitialized := true;
  end;
  
  procedure GetRecordOnce(ForceRefresh: Boolean)
  begin
    if ForceRefresh or not IsInitialized then begin
      Get();
      IsInitialized := true;
    end;
  end;
  
  procedure ClearCache()
  begin
    Clear(Rec);
    IsInitialized := false;
  end;
  
  var
    IsInitialized: Boolean;
}
```

**Usage**:
```al
// First call
Setup.GetRecordOnce();  // Loads from DB

// Subsequent calls
Setup.GetRecordOnce();  // Uses cache

// Force refresh after modify
Setup.ClearCache();
Setup.GetRecordOnce();  // Reloads from DB
```

### Global Setup Instance Pattern

For extremely high-performance scenarios:

```al
codeunit [ID] "[Prefix] Setup Management"
{
  var
    [Prefix]Setup: Record "[Prefix] Setup";
    IsInitialized: Boolean;
  
  procedure GetSetup(var SetupRec: Record "[Prefix] Setup")
  begin
    if not IsInitialized then begin
      if not [Prefix]Setup.Get() then begin
        [Prefix]Setup.Init();
        [Prefix]Setup.Insert();
      end;
      IsInitialized := true;
    end;
    
    SetupRec := [Prefix]Setup;
  end;
  
  procedure ClearCache()
  begin
    Clear([Prefix]Setup);
    IsInitialized := false;
  end;
  
  [EventSubscriber(ObjectType::Table, Database::"[Prefix] Setup", 'OnAfterModifyEvent', '', false, false)]
  local procedure OnAfterModifySetup(var Rec: Record "[Prefix] Setup")
  begin
    ClearCache();
  end;
}
```

**Advantage**: Single global instance cached at codeunit level, cleared automatically on modify.

## Validation Patterns

### Cross-Field Validation

```al
trigger OnValidate()
begin
  if "Enable Integration" then begin
    TestField("API Base URL");
    TestField("API Key");
  end;
end;
```

### Range Validation with User Confirmation

```al
field(60; "Batch Size"; Integer)
{
  Caption = 'Batch Size';
  DataClassification = CustomerContent;
  MinValue = 1;
  MaxValue = 10000;
  
  trigger OnValidate()
  begin
    if "Batch Size" > 1000 then
      if not Confirm('Batch sizes above 1000 may cause performance issues. Continue?') then
        Error('');
  end;
}
```

### Email Validation

```al
field(70; "Notification Email"; Text[250])
{
  Caption = 'Notification Email';
  DataClassification = EndUserIdentifiableInformation;
  ExtendedDatatype = EMail;
  
  trigger OnValidate()
  var
    MailManagement: Codeunit "Mail Management";
  begin
    if "Notification Email" <> '' then
      MailManagement.CheckValidEmailAddress("Notification Email");
  end;
}
```

## Testing Patterns

### Test Setup Access

```al
codeunit [ID] "[Prefix] Setup Test"
{
  Subtype = Test;
  
  [Test]
  procedure TestSetupAutoInitialization()
  var
    [Prefix]Setup: Record "[Prefix] Setup";
  begin
    // [GIVEN] Empty setup table
    [Prefix]Setup.DeleteAll();
    
    // [WHEN] GetRecordOnce is called
    [Prefix]Setup.GetRecordOnce();
    
    // [THEN] Record is created automatically
    Assert.RecordCount([Prefix]Setup, 1);
  end;
  
  [Test]
  procedure TestSetupSingleton()
  var
    [Prefix]Setup: Record "[Prefix] Setup";
  begin
    // [GIVEN] Existing setup record
    [Prefix]Setup.DeleteAll();
    [Prefix]Setup.Init();
    [Prefix]Setup.Insert();
    
    // [WHEN] Attempting to insert another record
    asserterror begin
      [Prefix]Setup.Init();
      [Prefix]Setup.Insert();
    end;
    
    // [THEN] Error occurs (only one record allowed)
    Assert.ExpectedError('');
  end;
}
```

## Cloud-Ready Patterns

### Avoiding OnInsert Defaults (Cloud Compatibility)

**Problem**: OnInsert triggers don't fire in cloud-based upgrade scenarios.

**Solution**: Use GetRecordOnce with explicit defaults.

```al
procedure GetRecordOnce()
begin
  if IsInitialized then
    exit;
  
  if not Get() then begin
    Init();
    // Set defaults explicitly here instead of OnInsert
    "Enable Feature" := true;
    "Max Retry Count" := 3;
    "Batch Size" := 100;
    Insert();
  end;
  
  IsInitialized := true;
end;
```

### API Integration with Secret Storage

For SaaS environments, use Isolated Storage for secrets:

```al
procedure SetAPIKey(APIKey: Text)
begin
  if EncryptionEnabled() then
    IsolatedStorage.SetEncrypted('[Prefix]APIKey', APIKey, DataScope::Company)
  else
    IsolatedStorage.Set('[Prefix]APIKey', APIKey, DataScope::Company);
end;

procedure GetAPIKey() APIKey: Text
begin
  if not IsolatedStorage.Get('[Prefix]APIKey', DataScope::Company, APIKey) then
    APIKey := '';
end;

procedure HasAPIKey(): Boolean
begin
  exit(IsolatedStorage.Contains('[Prefix]APIKey', DataScope::Company));
end;
```

**Benefit**: API keys stored securely, not in plain text field.

## Summary

These advanced patterns cover:
- Multi-company and per-user setup variations
- Advanced field types (Enums, DateFormulas, Options with validation)
- Multi-tab and conditional visibility UI patterns
- Setup table extensions for base BC tables
- Advanced caching and performance patterns
- Cross-field validation and email validation
- Test patterns for setup tables
- Cloud-ready patterns with Isolated Storage

Use these patterns when basic setup table doesn't meet requirements.
