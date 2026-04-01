# BC Attachments Generator - Code Templates

This file contains detailed AL code templates for implementing attachments, links, and notes on custom Business Central tables.

## Setup Table Fields

Add these fields to your setup table:

```al
field(10; "Enable Attachments"; Boolean)
{
  Caption = 'Enable Attachments on [Entity]';
  InitValue = true;
}
field(11; "Enable Links"; Boolean)
{
  Caption = 'Enable Links on [Entity]';
  InitValue = true;
}
field(12; "Enable Notes"; Boolean)
{
  Caption = 'Enable Notes on [Entity]';
  InitValue = true;
}
```

## Setup Page Fields

Add these fields to your setup page layout:

```al
field("Enable Attachments"; Rec."Enable Attachments")
{
  ApplicationArea = All;
  ToolTip = 'Specifies if attachments are enabled for [Entity].';
}
field("Enable Links"; Rec."Enable Links")
{
  ApplicationArea = All;
  ToolTip = 'Specifies if links are enabled for [Entity].';
}
field("Enable Notes"; Rec."Enable Notes")
{
  ApplicationArea = All;
  ToolTip = 'Specifies if notes are enabled for [Entity].';
}
```

## Enum Extension

```al
enumextension [ID] "[Prefix] Attachment Doc Type" extends "Attachment Document Type"
{
  value([ID]; [Prefix][Entity])
  {
    Caption = '[Entity]';
  }
}
```

**Note**: Remove spaces from entity name in enum value (e.g., "Statistical Account" → "BCSStatisticalAccount").

## Complete Attachment Management Codeunit

```al
codeunit [ID] "[Prefix] Attachment Management"
{
  // Event Subscriber: OnBeforeDrillDown (obsolete factbox BC 25.0)
  [EventSubscriber(ObjectType::Page, Page::"Document Attachment Factbox", 'OnBeforeDrillDown', '', false, false)]
  local procedure OnBeforeDrillDown(DocumentAttachment: Record "Document Attachment"; var RecRef: RecordRef)
  begin
    case DocumentAttachment."Table ID" of
      DATABASE::"[Base Table]":
        begin
          RecRef.Open(DATABASE::"[Base Table]");
          if [Entity].Get(DocumentAttachment."No.") then
            RecRef.GetTable([Entity]);
        end;
    end;
  end;
  
  // Event Subscriber: OnAfterOpenForRecRef
  [EventSubscriber(ObjectType::Page, Page::"Document Attachment Details", 'OnAfterOpenForRecRef', '', false, false)]
  local procedure OnAfterOpenForRecRef(var DocumentAttachment: Record "Document Attachment"; var RecRef: RecordRef)
  var
    FieldRef: FieldRef;
    RecNo: Code[20];
  begin
    case RecRef.Number of
      DATABASE::"[Base Table]":
        begin
          FieldRef := RecRef.Field([Entity].FieldNo("No."));
          RecNo := FieldRef.Value;
          DocumentAttachment.SetRange("No.", RecNo);
          DocumentAttachment.SetRange("Document Type", DocumentAttachment."Document Type"::[Prefix][Entity]);
        end;
    end;
  end;
  
  // Event Subscriber: OnAfterInitFieldsFromRecRef
  [EventSubscriber(ObjectType::Table, Database::"Document Attachment", 'OnAfterInitFieldsFromRecRef', '', false, false)]
  local procedure OnAfterInitFieldsFromRecRef(var DocumentAttachment: Record "Document Attachment"; var RecRef: RecordRef)
  var
    FieldRef: FieldRef;
    RecNo: Code[20];
  begin
    case RecRef.Number of
      DATABASE::"[Base Table]":
        begin
          FieldRef := RecRef.Field([Entity].FieldNo("No."));
          RecNo := FieldRef.Value;
          DocumentAttachment.Validate("No.", RecNo);
          DocumentAttachment.Validate("Document Type", DocumentAttachment."Document Type"::[Prefix][Entity]);
        end;
    end;
  end;
  
  // Visibility Control: Attachments
  procedure EntityEnabledAttachments(TableId: Integer): Boolean
  begin
    case TableId of
      DATABASE::"[Base Table]":
        begin
          if [Prefix][Entity]Setup.Get() then
            exit([Prefix][Entity]Setup."Enable Attachments");
          exit(false);
        end;
      else
        exit(false);
    end;
  end;
  
  // Visibility Control: Links
  procedure EntityEnabledLinks(TableId: Integer): Boolean
  begin
    case TableId of
      DATABASE::"[Base Table]":
        begin
          if [Prefix][Entity]Setup.Get() then
            exit([Prefix][Entity]Setup."Enable Links");
          exit(false);
        end;
      else
        exit(false);
    end;
  end;
  
  // Visibility Control: Notes
  procedure EntityEnabledNotes(TableId: Integer): Boolean
  begin
    case TableId of
      DATABASE::"[Base Table]":
        begin
          if [Prefix][Entity]Setup.Get() then
            exit([Prefix][Entity]Setup."Enable Notes");
          exit(false);
        end;
      else
        exit(false);
    end;
  end;
  
  // Lifecycle: Delete Related Attachments
  procedure DeleteRelatedDocumentAttachments([EntityNo]: Code[20])
  begin
    DocumentAttachment.Reset();
    DocumentAttachment.SetRange("Table ID", DATABASE::"[Base Table]");
    DocumentAttachment.SetRange("No.", [EntityNo]);
    if DocumentAttachment.FindSet() then
      DocumentAttachment.DeleteAll(true);
  end;
  
  // Lifecycle: Copy Related Attachments (for rename)
  procedure CopyRelatedDocumentAttachments(Previous[EntityNo]: Code[20]; New[EntityNo]: Code[20])
  var
    NewDocumentAttachment: Record "Document Attachment";
  begin
    DocumentAttachment.Reset();
    DocumentAttachment.SetRange("Table ID", DATABASE::"[Base Table]");
    DocumentAttachment.SetRange("No.", Previous[EntityNo]);
    if DocumentAttachment.FindSet() then
      repeat
        NewDocumentAttachment := DocumentAttachment;
        NewDocumentAttachment."No." := New[EntityNo];
        NewDocumentAttachment.Insert(true);
      until DocumentAttachment.Next() = 0;
  end;
  
  var
    [Entity]: Record "[Base Table]";
    [Prefix][Entity]Setup: Record "[Prefix] [Entity] Setup";
    DocumentAttachment: Record "Document Attachment";
}
```

## Table Extension Triggers

```al
tableextension [ID] "[Prefix] [Entity]" extends "[Base Table]"
{
  trigger OnBeforeRename()
  begin
    RenameAttachments();
  end;
  
  trigger OnBeforeDelete()
  begin
    [Prefix]AttachmentManagement.DeleteRelatedDocumentAttachments(Rec."No.");
  end;
  
  local procedure RenameAttachments()
  begin
    [Prefix]AttachmentManagement.CopyRelatedDocumentAttachments(xRec."No.", "No.");
    [Prefix]AttachmentManagement.DeleteRelatedDocumentAttachments(xRec."No.");
  end;
  
  var
    [Prefix]AttachmentManagement: Codeunit "[Prefix] Attachment Management";
}
```

## Page Extension: Card Page Factboxes

```al
pageextension [ID] "[Prefix] [Entity] Card" extends "[Base Entity Card]"
{
  layout
  {
    addfirst(factboxes)
    {
      // Legacy factbox (obsolete BC 25.0)
      part("Attached Documents"; "Document Attachment Factbox")
      {
        ApplicationArea = All;
        Caption = 'Attachments';
        ObsoleteTag = '25.0';
        ObsoleteState = Pending;
        ObsoleteReason = 'Replaced by Doc. Attachment List Factbox with multiple file upload support.';
        SubPageLink = "Table ID" = const(Database::"[Base Table]"),
                      "No." = field("No."),
                      "Document Type" = const([Prefix][Entity]);
        Visible = false;
        Editable = EnabledAttachments;
      }
      
      // Modern factbox (BC 25.0+)
      part("Attached Documents List"; "Doc. Attachment List Factbox")
      {
        ApplicationArea = All;
        Caption = 'Documents';
        UpdatePropagation = Both;
        SubPageLink = "Table ID" = const(Database::"[Base Table]"),
                      "No." = field("No.");
        Visible = EnabledAttachments;
        Editable = EnabledAttachments;
      }
    }
    
    // Control Links factbox visibility
    modify(Control1900383207)
    {
      Visible = EnableLinks;
    }
    
    // Control Notes factbox visibility
    modify(Control1905767507)
    {
      Visible = EnableNotes;
    }
  }
  
  trigger OnOpenPage()
  begin
    EnabledAttachments := [Prefix]AttachmentManagement.EntityEnabledAttachments(DATABASE::"[Base Table]");
    EnableLinks := [Prefix]AttachmentManagement.EntityEnabledLinks(DATABASE::"[Base Table]");
    EnableNotes := [Prefix]AttachmentManagement.EntityEnabledNotes(DATABASE::"[Base Table]");
  end;
  
  var
    [Prefix]AttachmentManagement: Codeunit "[Prefix] Attachment Management";
    EnabledAttachments: Boolean;
    EnableLinks: Boolean;
    EnableNotes: Boolean;
}
```

**Note**: Control IDs for Links (1900383207) and Notes (1905767507) may vary between BC versions. Inspect the base page if modify fails.

## Page Extension: List Page Factboxes

Use the same structure as the Card Page extension above for the List page.

## Multi-Entity Support Pattern

When supporting multiple entities, add cases to each event subscriber:

```al
[EventSubscriber(ObjectType::Page, Page::"Document Attachment Details", 'OnAfterOpenForRecRef', '', false, false)]
local procedure OnAfterOpenForRecRef(var DocumentAttachment: Record "Document Attachment"; var RecRef: RecordRef)
var
  FieldRef: FieldRef;
  RecNo: Code[20];
begin
  case RecRef.Number of
    DATABASE::"Entity One":
      begin
        FieldRef := RecRef.Field(EntityOne.FieldNo("No."));
        RecNo := FieldRef.Value;
        DocumentAttachment.SetRange("No.", RecNo);
        DocumentAttachment.SetRange("Document Type", DocumentAttachment."Document Type"::PrefixEntityOne);
      end;
    DATABASE::"Entity Two":
      begin
        FieldRef := RecRef.Field(EntityTwo.FieldNo("No."));
        RecNo := FieldRef.Value;
        DocumentAttachment.SetRange("No.", RecNo);
        DocumentAttachment.SetRange("Document Type", DocumentAttachment."Document Type"::PrefixEntityTwo);
      end;
  end;
end;
```

## Advanced Patterns

### Attachment Count FlowField

```al
field([ID]; "Attachment Count"; Integer)
{
  Caption = 'Attachments';
  FieldClass = FlowField;
  CalcFormula = count("Document Attachment" where("Table ID" = const(Database::"[Base Table]"),
                                                   "No." = field("No.")));
  Editable = false;
}
```

### Custom Attachment Validation

```al
trigger OnBeforeInsert()
begin
  if not ValidateAttachmentPermissions() then
    Error('User does not have permission to add attachments to this record.');
end;

local procedure ValidateAttachmentPermissions(): Boolean
var
  UserSetup: Record "User Setup";
begin
  if UserSetup.Get(UserId) then
    exit(UserSetup."Allow Attachments");
  exit(false);
end;
```

### Power Automate Integration Event

```al
[IntegrationEvent(false, false)]
local procedure OnAfterAttachmentAdded(var DocumentAttachment: Record "Document Attachment")
begin
end;

[EventSubscriber(ObjectType::Table, Database::"Document Attachment", 'OnAfterInsertEvent', '', false, false)]
local procedure OnAfterAttachmentInsert(var Rec: Record "Document Attachment")
begin
  if Rec."Table ID" = DATABASE::"[Base Table]" then
    OnAfterAttachmentAdded(Rec);
end;
```
