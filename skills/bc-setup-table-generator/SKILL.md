---
name: bc-setup-table-generator
description: Generates setup table and page objects for Business Central following singleton pattern. Creates setup tables with single-record pattern, primary key field, setup page with auto-initialization on OnOpenPage, GetRecordOnce codeunit helper for performance, and common setup field patterns (Enable/Disable toggles, Default values, Number Series references, Path fields, User IDs). Handles DrillDownPageID and LookupPageID for seamless navigation. Supports multi-tenant and cloud-ready patterns. Use when creating setup tables, implementing module configuration, adding settings tables, creating admin configuration pages, building extension setup, or implementing singleton setup patterns for Business Central.
---

# Business Central Setup Table Generator

Generates setup tables and pages following Microsoft's singleton pattern for Business Central extensions. Creates single-record tables for module configuration with automatic initialization and performance-optimized access patterns.

## Overview

Setup tables are singleton tables (one record per company) used to store module-wide configuration. This skill generates:
- Setup table with singleton pattern
- Setup page (Card) with auto-initialization
- GetRecordOnce helper for performance
- Common field patterns

**Advanced patterns and variations**: [references/patterns.md](references/patterns.md)

## Prerequisites

- AL workspace with established object ID range
- Module/feature name defined
- Prefix established (e.g., BCS, CUSTOM, etc.)
- List of configuration settings to expose

## Quick Start

### 1. Basic Setup Table Structure

```al
table [ID] "[Prefix] [Module] Setup"
{
  Caption = '[Module] Setup';
  DataClassification = CustomerContent;
  DrillDownPageID = "[Prefix] [Module] Setup";
  LookupPageID = "[Prefix] [Module] Setup";
  
  fields
  {
    field(1; "Primary Key"; Code[10])
    {
      Caption = 'Primary Key';
      DataClassification = SystemMetadata;
      AllowInCustomizations = Never;
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

**Key Properties**:
- **DataClassification**: Use `CustomerContent` for business data, `SystemMetadata` for technical fields
- **DrillDownPageID** / **LookupPageID**: Point to setup page for seamless navigation
- **Primary Key field**: Always Code[10], never visible to user

### 2. Setup Page with Auto-Initialization

```al
page [ID] "[Prefix] [Module] Setup"
{
  ApplicationArea = All;
  Caption = '[Module] Setup';
  PageType = Card;
  SourceTable = "[Prefix] [Module] Setup";
  UsageCategory = Administration;
  DeleteAllowed = false;
  InsertAllowed = false;
  
  layout
  {
    area(Content)
    {
      group(General)
      {
        Caption = 'General';
        
        // Add fields here
      }
    }
  }
  
  trigger OnOpenPage()
  begin
    Rec.Reset();
    if not Rec.Get() then begin
      Rec.Init();
      Rec.Insert();
    end;
  end;
}
```

**Key Properties**:
- **PageType = Card**: Single-record view
- **UsageCategory = Administration**: Shows in search results under Administration
- **DeleteAllowed/InsertAllowed = false**: Prevents accidental deletion/duplication
- **OnOpenPage**: Auto-creates record if missing (singleton pattern)

### 3. GetRecordOnce Helper Pattern (Optional but Recommended)

Add to setup table for performance optimization:

```al
table [ID] "[Prefix] [Module] Setup"
{
  // ... fields and keys ...
  
  procedure GetRecordOnce()
  begin
    if IsInitialized then
      exit;
    
    if not Get() then begin
      Init();
      Insert();
    end;
    
    IsInitialized := true;
  end;
  
  var
    IsInitialized: Boolean;
}
```

**Usage Pattern**:
```al
// In consuming codeunits
local procedure GetDefaultValue(): Text[50]
var
  [Prefix]Setup: Record "[Prefix] [Module] Setup";
begin
  [Prefix]Setup.GetRecordOnce();
  exit([Prefix]Setup."Default Value");
end;
```

**Performance Benefit**: GetRecordOnce caches record in memory, avoiding repeated database reads.

## Common Field Patterns

### Pattern 1: Enable/Disable Features

```al
field(10; "Enable Feature"; Boolean)
{
  Caption = 'Enable Feature';
  DataClassification = CustomerContent;
  ToolTip = 'Specifies whether the feature is enabled.';
}
```

**ToolTip Rule**: Always start with "Specifies..." for setup fields.

### Pattern 2: Number Series References

```al
field(20; "Document Nos."; Code[20])
{
  Caption = 'Document Nos.';
  DataClassification = CustomerContent;
  TableRelation = "No. Series";
  ToolTip = 'Specifies the number series used for document numbers.';
}
```

**TableRelation**: Points to No. Series table for dropdown lookup.

### Pattern 3: Default Values

```al
field(30; "Default Location"; Code[10])
{
  Caption = 'Default Location';
  DataClassification = CustomerContent;
  TableRelation = Location;
  ToolTip = 'Specifies the default location for operations.';
}
```

### Pattern 4: User ID References

```al
field(40; "Default User ID"; Code[50])
{
  Caption = 'Default User ID';
  DataClassification = EndUserIdentifiableInformation;
  TableRelation = User."User Name";
  ToolTip = 'Specifies the default user for automated operations.';
}
```

**DataClassification**: Use `EndUserIdentifiableInformation` for user references.

### Pattern 5: API Integration Settings

```al
field(50; "API Base URL"; Text[250])
{
  Caption = 'API Base URL';
  DataClassification = CustomerContent;
  ExtendedDatatype = URL;
  ToolTip = 'Specifies the base URL for the external API.';
}

field(51; "API Key"; Text[100])
{
  Caption = 'API Key';
  DataClassification = EndUserIdentifiableInformation;
  ExtendedDatatype = Masked;
  ToolTip = 'Specifies the API key for authentication.';
}
```

**ExtendedDatatype**:
- **URL**: Validates URL format
- **Masked**: Hides value with asterisks for sensitive data

### Pattern 6: File Paths and Directories

```al
field(60; "Export Path"; Text[250])
{
  Caption = 'Export Path';
  DataClassification = CustomerContent;
  ToolTip = 'Specifies the folder path for exported files.';
}
```

## Setup Page Layout Patterns

### Group Organization

Organize fields into logical groups:

```al
layout
{
  area(Content)
  {
    group(General)
    {
      Caption = 'General';
      // Basic module settings
    }
    
    group("Number Series")
    {
      Caption = 'Number Series';
      // All number series fields
    }
    
    group("Integration")
    {
      Caption = 'Integration';
      // API settings, external system config
    }
    
    group("Defaults")
    {
      Caption = 'Defaults';
      // Default values for operations
    }
  }
}
```

### Promoted Actions

Add actions for common setup tasks:

```al
actions
{
  area(Processing)
  {
    action(ResetToDefaults)
    {
      ApplicationArea = All;
      Caption = 'Reset to Defaults';
      Image = Restore;
      ToolTip = 'Reset all settings to default values.';
      Promoted = true;
      PromotedCategory = Process;
      PromotedIsBig = true;
      
      trigger OnAction()
      begin
        if Confirm('Reset all settings to defaults?', false) then begin
          Rec.Init();
          Rec.Modify();
          CurrPage.Update();
          Message('Settings have been reset to defaults.');
        end;
      end;
    }
    
    action(TestConnection)
    {
      ApplicationArea = All;
      Caption = 'Test Connection';
      Image = TestDatabase;
      ToolTip = 'Test connection to external system.';
      Promoted = true;
      PromotedCategory = Process;
      
      trigger OnAction()
      begin
        // Test connection logic
      end;
    }
  }
}
```

## Implementation Workflow

### Step 1: Gather Requirements

Ask user for:
- Module name (e.g., "Statistical Accounts", "Custom Workflow")
- Prefix (e.g., "BCS")
- Object IDs (table and page)
- List of settings/fields needed
- Field logical groupings

### Step 2: Create Setup Table

1. Create table file: `[Prefix][Entity]Setup.Table.al`
2. Add primary key field
3. Add DrillDownPageID and LookupPageID properties
4. Add configuration fields with proper:
   - DataClassification
   - TableRelation (for lookups)
   - ExtendedDatatype (for URLs, masked values)
   - ToolTip (starting with "Specifies...")

### Step 3: Add GetRecordOnce Helper (Recommended)

Add GetRecordOnce procedure and IsInitialized variable to table for performance.

### Step 4: Create Setup Page

1. Create page file: `[Prefix][Entity]Setup.Page.al`
2. Set PageType = Card
3. Set UsageCategory = Administration
4. Disable DeleteAllowed and InsertAllowed
5. Add OnOpenPage initialization trigger
6. Organize fields into logical groups
7. Add relevant actions (Reset to Defaults, Test Connection, etc.)

### Step 5: Validation and Testing

- Build to check for compilation errors
- Test page opens and auto-creates record
- Verify lookups work (Number Series, TableRelations)
- Test GetRecordOnce caching behavior
- Validate ToolTips display correctly

### Step 6: Permission Set

Generate or update permission set to include:
- Setup table (RIMD permissions)
- Setup page (Read permission)

## Pre-Flight Checklist

Before generating, verify:

- [ ] Object IDs available and in valid range
- [ ] Prefix follows project conventions
- [ ] Module name is clear and descriptive
- [ ] All required configuration fields identified
- [ ] Field groupings planned
- [ ] DataClassification determined for each field
- [ ] TableRelation targets identified for lookup fields
- [ ] ToolTip text prepared for all fields

## Common Variations

### Multi-Tab Setup Pages

For complex modules with many settings:

```al
layout
{
  area(Content)
  {
    group(General)
    {
      // General settings
    }
  }
  
  area(FactBoxes)
  {
    // Related information
  }
}
```

Or use FastTabs:

```al
layout
{
  area(Content)
  {
    group(GeneralTab)
    {
      Caption = 'General';
      // Fields
    }
    
    group(IntegrationTab)
    {
      Caption = 'Integration';
      // Fields
    }
  }
}
```

See [references/patterns.md](references/patterns.md) for advanced multi-tab patterns.

### Setup with Validation

Add field validation for complex rules:

```al
field(10; "Max Retry Count"; Integer)
{
  Caption = 'Max Retry Count';
  DataClassification = CustomerContent;
  MinValue = 1;
  MaxValue = 10;
  
  trigger OnValidate()
  begin
    if "Max Retry Count" > 5 then
      if not Confirm('Values above 5 may impact performance. Continue?') then
        Error('');
  end;
}
```

### Setup with Table Extension Pattern

For extending base BC setup tables:

```al
tableextension [ID] "[Prefix] [Base Setup]" extends "[Base Setup Table]"
{
  fields
  {
    field([ID]; "[Prefix] Custom Field"; Boolean)
    {
      Caption = 'Custom Field';
      DataClassification = CustomerContent;
    }
  }
}

pageextension [ID] "[Prefix] [Base Setup]" extends "[Base Setup Page]"
{
  layout
  {
    addlast(Content)
    {
      group("[Prefix] Custom")
      {
        Caption = 'Custom Settings';
        
        field("[Prefix] Custom Field"; Rec."[Prefix] Custom Field")
        {
          ApplicationArea = All;
        }
      }
    }
  }
}
```

See [references/patterns.md](references/patterns.md) for complete setup extension patterns.

## Best Practices

1. **Singleton Enforcement**: Always use OnOpenPage to auto-create record
2. **Prevent Deletion**: Set DeleteAllowed = false, InsertAllowed = false
3. **Use GetRecordOnce**: Cache record for repeated access in same transaction
4. **Organize with Groups**: Group related fields logically
5. **Meaningful ToolTips**: Start with "Specifies..." and provide clear guidance
6. **Proper DataClassification**: 
   - CustomerContent for business data
   - EndUserIdentifiableInformation for user references, API keys
   - SystemMetadata for technical fields (Primary Key)
7. **UsageCategory = Administration**: Makes setup findable via search
8. **DrillDown/Lookup Pages**: Point to setup page for seamless navigation

## External References

- [Microsoft Docs: Creating Setup Tables](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-table-object)
- [BC Patterns: Singleton Tables](https://www.kauffmann.nl/2019/03/14/business-central-singleton-tables/)
- [Setup Table Performance Best Practices](https://www.hougaard.com/al-performance-patterns/)

## Version

Initial release: 1.0.0
