# Business Events Code Templates

Complete AL code templates for implementing external business events in Business Central.

## Table of Contents

1. [Enum Extension - Event Category](#enum-extension-event-category)
2. [Business Events Codeunit Structure](#business-events-codeunit-structure)
3. [Event Subscriber Pattern](#event-subscriber-pattern)
4. [External Business Event Procedures](#external-business-event-procedures)
5. [Integration Event Publishers](#integration-event-publishers)
6. [Complete Working Example](#complete-working-example)
7. [Advanced Patterns](#advanced-patterns)

---

## Enum Extension - Event Category

Every business event requires a custom EventCategory. BC does not allow using standard categories for custom business events.

### Basic Enum Extension

```al
enumextension 50100 "MyExt EventCategory" extends EventCategory
{
  value(50100; "My Custom Events")
  {
    Caption = 'My Custom Events';
  }
}
```

### Multiple Categories

If you have multiple business areas, consider multiple categories for better organization:

```al
enumextension 50100 "MyExt EventCategory" extends EventCategory
{
  value(50100; "Sales Management")
  {
    Caption = 'Sales Management';
  }
  
  value(50101; "Inventory Operations")
  {
    Caption = 'Inventory Operations';
  }
  
  value(50102; "Financial Processes")
  {
    Caption = 'Financial Processes';
  }
}
```

**Naming conventions**:
- Use descriptive category names that business users understand
- Avoid technical jargon
- Keep caption concise (appears in Power Automate)

---

## Business Events Codeunit Structure

The business events codeunit contains both event subscribers (listening to internal events) and external business event procedures.

### Basic Structure

```al
codeunit 50100 "MyExt Business Events"
{
  // Event Subscribers listen to internal BC events
  [EventSubscriber(ObjectType::Table, Database::"Your Table", OnSomeEvent, '', false, false)]
  local procedure OnYourTableEvent(var YourTable: Record "Your Table")
  begin
    // Extract business data and call external business event
    OnYourBusinessEventHappened(YourTable.SystemId, YourTable."No.", YourTable.Description);
  end;

  // External Business Events are the public API
  [ExternalBusinessEvent('yourEventName', 'Your Event Display Name', 'Triggered when something business-relevant happens', EventCategory::"My Custom Events")]
  procedure OnYourBusinessEventHappened(EntityID: GUID; EntityNo: Code[20]; Description: Text[100])
  begin
    // Leave empty - external invocation handled by attribute
  end;
}
```

### Multiple Events Structure

```al
codeunit 50100 "Sales Mgmt Business Events"
{
  // ======================================
  // Event Subscribers
  // ======================================
  
  [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", OnAfterSalesOrderPost, '', false, false)]
  local procedure OnAfterSalesOrderPost(var SalesHeader: Record "Sales Header"; SalesInvHeader: Record "Sales Invoice Header")
  begin
    OnSalesOrderPosted(
      SalesInvHeader.SystemId,
      SalesInvHeader."No.",
      SalesInvHeader."Sell-to Customer No.",
      SalesInvHeader."Order No.",
      SalesInvHeader.Amount
    );
  end;

  [EventSubscriber(ObjectType::Table, Database::Customer, OnAfterModifyEvent, '', false, false)]
  local procedure OnCustomerModified(var Rec: Record Customer; var xRec: Record Customer)
  begin
    // Only fire event if blocked status actually changed
    if Rec.Blocked <> xRec.Blocked then
      OnCustomerBlockedStatusChanged(
        Rec.SystemId,
        Rec."No.",
        Rec.Name,
        Format(Rec.Blocked)
      );
  end;

  // ======================================
  // External Business Events
  // ======================================
  
  [ExternalBusinessEvent('salesOrderPosted', 'Sales Order Posted', 'Triggered when a sales order is successfully posted and invoiced', EventCategory::"Sales Management")]
  procedure OnSalesOrderPosted(InvoiceID: GUID; InvoiceNo: Code[20]; CustomerNo: Code[20]; OrderNo: Code[20]; Amount: Decimal)
  begin
  end;

  [ExternalBusinessEvent('customerBlockedStatusChanged', 'Customer Blocked Status Changed', 'Triggered when customer blocked status is modified', EventCategory::"Sales Management")]
  procedure OnCustomerBlockedStatusChanged(CustomerID: GUID; CustomerNo: Code[20]; CustomerName: Text[100]; BlockedStatus: Text[50])
  begin
  end;
}
```

**Organization**:
- Group event subscribers at top
- Group external business events below
- Add comments for section clarity
- Keep all events for one business area in one codeunit

---

## Event Subscriber Pattern

Event subscribers bridge internal BC events to external business events. They extract relevant business data and invoke the external business event procedure.

### Subscribing to Table Lifecycle Events

For custom table extensions with IntegrationEvent publishers:

```al
[EventSubscriber(ObjectType::Table, Database::"Statistical Account", OnAfterInsertStatisticalAccount, '', false, false)]
local procedure OnAfterInsertStatisticalAccount(var StatisticalAccount: Record "Statistical Account")
begin
  OnStatisticalAccountCreated(
    StatisticalAccount.SystemId,
    StatisticalAccount."No.",
    StatisticalAccount.Name
  );
end;
```

### Subscribing to Standard BC Posting Events

For standard BC posting codeunits:

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Stat. Acc. Jnl. Line Post", OnBeforeInsertStatisticalLedgerEntry, '', false, false)]
local procedure OnBeforeInsertStatisticalLedgerEntry(
  var StatisticalAccJournalLine: Record "Statistical Acc. Journal Line";
  var StatisticalLedgerEntry: Record "Statistical Ledger Entry"
)
begin
  OnBeforeStatisticalLedgerEntryPosted(
    StatisticalLedgerEntry.SystemId,
    StatisticalAccJournalLine."Statistical Account No.",
    StatisticalAccJournalLine."Posting Date",
    StatisticalAccJournalLine.Amount,
    StatisticalAccJournalLine."Document No.",
    StatisticalLedgerEntry."Entry No."
  );
end;
```

### Conditional Event Firing

Only fire business events when business conditions are met:

```al
[EventSubscriber(ObjectType::Table, Database::Item, OnAfterModifyEvent, '', false, false)]
local procedure OnItemModified(var Rec: Record Item; var xRec: Record Item)
begin
  // Only fire if inventory below reorder point
  if (Rec.Inventory < Rec."Reorder Point") and (xRec.Inventory >= xRec."Reorder Point") then
    OnInventoryBelowReorderPoint(
      Rec.SystemId,
      Rec."No.",
      Rec.Description,
      Rec.Inventory,
      Rec."Reorder Point"
    );
end;
```

### Event Discovery

Use AL Explorer in VS Code to discover events:
1. Open Command Palette (Ctrl+Shift+P)
2. Search "AL: Show Events"
3. Filter by module/object
4. Click "Subscribe" to generate subscriber template

---

## External Business Event Procedures

External business events are procedures decorated with the `[ExternalBusinessEvent]` attribute. These are the public API contracts that external systems subscribe to.

### Basic External Business Event

```al
[ExternalBusinessEvent('entityCreated', 'Entity Created', 'Triggered when a new entity is created', EventCategory::"My Custom Events")]
procedure OnEntityCreated(EntityID: GUID; EntityNo: Code[20]; EntityName: Text[100])
begin
  // Leave body empty - external invocation handled by attribute
end;
```

### ExternalBusinessEvent Attribute Parameters

```al
[ExternalBusinessEvent(
  'eventName',           // 1. Event identifier (camelCase, no spaces)
  'Display Name',        // 2. Human-readable name (shown in Power Automate)
  'Full description',    // 3. Complete sentence explaining when fired
  EventCategory::"Cat"   // 4. Your custom EventCategory enum value
)]
```

**Parameter guidelines**:
1. **eventName**: Lowercase, camelCase, descriptive, stable identifier
2. **Display Name**: Short, human-readable, appears in Power Automate trigger list
3. **Description**: Complete sentence, business-focused explanation
4. **EventCategory**: Your custom category from enum extension

### Procedure Parameters Best Practices

**Always include SystemId first**:
```al
procedure OnEntityEvent(EntityID: GUID; ...)
```

**Use business-relevant fields**:
```al
// ✅ GOOD - Business semantics
procedure OnSalesOrderReleased(OrderID: GUID; OrderNo: Code[20]; CustomerNo: Code[20]; TotalAmount: Decimal)

// ❌ AVOID - Too many technical details
procedure OnSalesOrderReleased(var SalesHeader: Record "Sales Header")
```

**Keep parameter count reasonable**:
```al
// ✅ GOOD - Essential data only (5-7 parameters max)
procedure OnInvoicePosted(InvoiceID: GUID; InvoiceNo: Code[20]; CustomerNo: Code[20]; PostingDate: Date; Amount: Decimal)

// ❌ AVOID - Too many parameters (hard to consume)
procedure OnInvoicePosted(ID: GUID; No: Code[20]; CustNo: Code[20]; Date: Date; Amt: Decimal; Qty: Integer; Disc: Decimal; Tax: Decimal; Ship: Code[10]; ...)
```

### Data Type Considerations

```al
// Use appropriate AL data types
procedure OnBusinessEvent(
  EntityID: GUID;              // Always GUID for entity tracking
  Number: Code[20];            // Use Code for identifiers
  Date: Date;                  // Date fields
  Amount: Decimal;             // Numeric values
  Status: Enum "Your Enum";    // Use enums for statuses
  Description: Text[100]       // Text with reasonable length
)
```

**Avoid**:
- Record variables (pass fields, not entire records)
- Temporary tables (cannot be serialized)
- Complex types (Blob, RecordRef unless necessary)

---

## Integration Event Publishers

Integration event publishers create extension points in your own code. Add these to custom table extensions or codeunits to allow business events to subscribe.

### Table Extension with IntegrationEvent

```al
tableextension 50100 "Custom Table Ext" extends "Some Table"
{
  fields
  {
    field(50100; "Custom Field"; Code[20])
    {
      Caption = 'Custom Field';
      DataClassification = CustomerContent;
    }
  }

  trigger OnAfterInsert()
  begin
    // Call IntegrationEvent publisher
    OnAfterInsertCustomRecord(Rec);
  end;

  trigger OnAfterModify()
  begin
    OnAfterModifyCustomRecord(Rec, xRec);
  end;

  trigger OnBeforeDelete()
  begin
    OnBeforeDeleteCustomRecord(Rec);
  end;

  // IntegrationEvent Publishers
  [IntegrationEvent(false, false)]
  local procedure OnAfterInsertCustomRecord(var YourTable: Record "Some Table")
  begin
  end;

  [IntegrationEvent(false, false)]
  local procedure OnAfterModifyCustomRecord(var YourTable: Record "Some Table"; xYourTable: Record "Some Table")
  begin
  end;

  [IntegrationEvent(false, false)]
  local procedure OnBeforeDeleteCustomRecord(var YourTable: Record "Some Table")
  begin
  end;
}
```

### Codeunit with IntegrationEvent

For custom business logic:

```al
codeunit 50101 "Custom Process Mgmt"
{
  procedure ProcessRecords(var TempRecords: Record "Some Table" temporary)
  var
    ProcessedCount: Integer;
  begin
    ProcessedCount := 0;
    
    if TempRecords.FindSet() then
      repeat
        // Processing logic
        ProcessedCount += 1;
      until TempRecords.Next() = 0;
    
    // Call IntegrationEvent after processing
    OnAfterProcessRecords(TempRecords, ProcessedCount);
  end;

  [IntegrationEvent(false, false)]
  local procedure OnAfterProcessRecords(var TempRecords: Record "Some Table" temporary; ProcessedCount: Integer)
  begin
  end;
}
```

### IntegrationEvent Attribute Parameters

```al
[IntegrationEvent(
  IncludeSender: Boolean,     // false usually (sender object not needed)
  GlobalVarAccess: Boolean    // false usually (no global variable access)
)]
```

**Standard practice**: Use `[IntegrationEvent(false, false)]` unless you have specific needs for sender object or global variable access.

---

## Complete Working Example

Complete implementation based on Statistical Accounts business events from BC Scout Path repository.

### 1. Enum Extension

```al
enumextension 60701 "BCS EventCategory" extends EventCategory
{
  value(60700; "BCS Stat. Accounts")
  {
    Caption = 'Stat. Accounts';
  }
}
```

### 2. Table Extension with IntegrationEvent

```al
tableextension 60700 "BCS Statistical Account" extends "Statistical Account"
{
  fields
  {
    field(60700; "BCS No. Series"; Code[20])
    {
      Caption = 'No. Series';
      DataClassification = ToBeClassified;
      TableRelation = "No. Series";
    }
  }

  trigger OnAfterInsert()
  begin
    // Call IntegrationEvent publisher
    OnAfterInsertStatisticalAccount(Rec);
  end;

  // IntegrationEvent Publisher
  [IntegrationEvent(false, false)]
  local procedure OnAfterInsertStatisticalAccount(var StatisticalAccount: Record "Statistical Account")
  begin
  end;

  var
    BCSStatisticalAccountSetup: Record "BCS Statistical Account Setup";
    NoSeries: Codeunit "No. Series";
}
```

### 3. Business Events Codeunit

```al
codeunit 60703 "BCS Business Events"
{
  // ======================================
  // Event Subscribers
  // ======================================

  [EventSubscriber(ObjectType::Codeunit, Codeunit::"Stat. Acc. Jnl. Line Post", OnBeforeInsertStatisticalLedgerEntry, '', false, false)]
  local procedure OnBeforeInsertStatLedgerEntry(
    var StatisticalAccJournalLine: Record "Statistical Acc. Journal Line";
    var StatisticalLedgerEntry: Record "Statistical Ledger Entry"
  )
  begin
    OnBeforeStatisticalLedgerEntryPosted(
      StatisticalLedgerEntry.SystemId,
      StatisticalAccJournalLine."Statistical Account No.",
      StatisticalAccJournalLine."Posting Date",
      StatisticalAccJournalLine.Amount,
      StatisticalAccJournalLine."Document No.",
      StatisticalLedgerEntry."Entry No."
    );
  end;

  [EventSubscriber(ObjectType::Table, Database::"Statistical Account", OnAfterInsertStatisticalAccount, '', false, false)]
  local procedure OnAfterInsertStatisticalAccount(var StatisticalAccount: Record "Statistical Account")
  begin
    OnStatisticalAccountCreated(
      StatisticalAccount.SystemId,
      StatisticalAccount."No.",
      StatisticalAccount.Name
    );
  end;

  // ======================================
  // External Business Events
  // ======================================

  [ExternalBusinessEvent('beforeStatisticalLedgerEntryPosted', 'before statistical ledger entry is posted', 'Triggered before the statistical ledger entry is posted', EventCategory::"BCS Stat. Accounts")]
  procedure OnBeforeStatisticalLedgerEntryPosted(
    EntryID: GUID;
    StatisticalAccountNo: Code[20];
    PostingDate: Date;
    Amount: Decimal;
    DocumentNo: Code[20];
    EntryNo: Integer
  )
  begin
  end;

  [ExternalBusinessEvent('statisticalAccountCreated', 'statistical account created', 'Triggered when a new statistical account is created', EventCategory::"BCS Stat. Accounts")]
  procedure OnStatisticalAccountCreated(
    StatisticalAccountID: GUID;
    AccountNo: Code[20];
    AccountName: Text[100]
  )
  begin
  end;
}
```

### Usage in Power Automate

After publishing this extension:

1. **In BC**: Verify events appear in "Business Event Subscriptions" page
2. **In Power Automate**: 
   - Create automated cloud flow
   - Select "When a Business Central event occurs" trigger
   - Choose BC environment and company
   - Select category "Stat. Accounts"
   - Select event "statistical account created" or "before statistical ledger entry is posted"
   - Add actions (send email, create record, etc.)
3. **Test**: Create statistical account in BC → verify flow triggers

---

## Advanced Patterns

### Pattern 1: Conditional Event with Status Change

Only fire events when business status changes:

```al
[EventSubscriber(ObjectType::Table, Database::Customer, OnAfterModifyEvent, '', false, false)]
local procedure OnCustomerModified(var Rec: Record Customer; var xRec: Record Customer)
begin
  // Customer became blocked
  if (Rec.Blocked <> Rec.Blocked::" ") and (xRec.Blocked = xRec.Blocked::" ") then
    OnCustomerBlocked(Rec.SystemId, Rec."No.", Rec.Name, Format(Rec.Blocked));
  
  // Customer became unblocked
  if (Rec.Blocked = Rec.Blocked::" ") and (xRec.Blocked <> xRec.Blocked::" ") then
    OnCustomerUnblocked(Rec.SystemId, Rec."No.", Rec.Name);
end;

[ExternalBusinessEvent('customerBlocked', 'Customer Blocked', 'Triggered when a customer is blocked', EventCategory::"Sales Management")]
procedure OnCustomerBlocked(CustomerID: GUID; CustomerNo: Code[20]; CustomerName: Text[100]; BlockedReason: Text[50])
begin
end;

[ExternalBusinessEvent('customerUnblocked', 'Customer Unblocked', 'Triggered when a customer is unblocked', EventCategory::"Sales Management")]
procedure OnCustomerUnblocked(CustomerID: GUID; CustomerNo: Code[20]; CustomerName: Text[100])
begin
end;
```

### Pattern 2: Threshold-Based Events

Fire events when business thresholds are crossed:

```al
[EventSubscriber(ObjectType::Table, Database::Item, OnAfterModifyEvent, '', false, false)]
local procedure OnItemInventoryChanged(var Rec: Record Item; var xRec: Record Item)
begin
  // Inventory crossed below reorder point
  if (Rec.Inventory < Rec."Reorder Point") and (xRec.Inventory >= xRec."Reorder Point") then
    OnInventoryBelowReorderPoint(Rec.SystemId, Rec."No.", Rec.Description, Rec.Inventory, Rec."Reorder Point");
  
  // Inventory went to zero
  if (Rec.Inventory = 0) and (xRec.Inventory > 0) then
    OnInventoryDepleted(Rec.SystemId, Rec."No.", Rec.Description);
end;

[ExternalBusinessEvent('inventoryBelowReorderPoint', 'Inventory Below Reorder Point', 'Triggered when item inventory falls below reorder point', EventCategory::"Inventory Operations")]
procedure OnInventoryBelowReorderPoint(ItemID: GUID; ItemNo: Code[20]; Description: Text[100]; CurrentInventory: Decimal; ReorderPoint: Decimal)
begin
end;

[ExternalBusinessEvent('inventoryDepleted', 'Inventory Depleted', 'Triggered when item inventory reaches zero', EventCategory::"Inventory Operations")]
procedure OnInventoryDepleted(ItemID: GUID; ItemNo: Code[20]; Description: Text[100])
begin
end;
```

### Pattern 3: Batch Process Events

For processes handling multiple records:

```al
procedure PostBatch(var TempSalesHeaders: Record "Sales Header" temporary): Boolean
var
  SalesPost: Codeunit "Sales-Post";
  PostedCount: Integer;
  FailedCount: Integer;
  BatchID: GUID;
begin
  BatchID := CreateGuid();
  PostedCount := 0;
  FailedCount := 0;
  
  if TempSalesHeaders.FindSet() then
    repeat
      if SalesPost.Run(TempSalesHeaders) then
        PostedCount += 1
      else
        FailedCount += 1;
    until TempSalesHeaders.Next() = 0;
  
  // Fire batch event
  OnBatchPostCompleted(BatchID, PostedCount, FailedCount);
  
  exit(FailedCount = 0);
end;

[ExternalBusinessEvent('batchPostCompleted', 'Batch Post Completed', 'Triggered when batch posting process completes', EventCategory::"Sales Management")]
procedure OnBatchPostCompleted(BatchID: GUID; PostedCount: Integer; FailedCount: Integer)
begin
end;
```

### Pattern 4: Error Events

Expose business errors as events:

```al
procedure ProcessPayment(CustomerNo: Code[20]; Amount: Decimal): Boolean
var
  Customer: Record Customer;
  ErrorMsg: Text;
begin
  if not Customer.Get(CustomerNo) then begin
    ErrorMsg := StrSubstNo('Customer %1 not found', CustomerNo);
    OnPaymentProcessingFailed(CreateGuid(), CustomerNo, Amount, ErrorMsg);
    exit(false);
  end;
  
  if Customer.Blocked <> Customer.Blocked::" " then begin
    ErrorMsg := StrSubstNo('Customer %1 is blocked', CustomerNo);
    OnPaymentProcessingFailed(Customer.SystemId, CustomerNo, Amount, ErrorMsg);
    exit(false);
  end;
  
  // Process payment...
  
  OnPaymentProcessed(Customer.SystemId, CustomerNo, Amount);
  exit(true);
end;

[ExternalBusinessEvent('paymentProcessed', 'Payment Processed', 'Triggered when payment is successfully processed', EventCategory::"Financial Processes")]
procedure OnPaymentProcessed(CustomerID: GUID; CustomerNo: Code[20]; Amount: Decimal)
begin
end;

[ExternalBusinessEvent('paymentProcessingFailed', 'Payment Processing Failed', 'Triggered when payment processing fails', EventCategory::"Financial Processes")]
procedure OnPaymentProcessingFailed(CustomerID: GUID; CustomerNo: Code[20]; Amount: Decimal; ErrorMessage: Text[250])
begin
end;
```

### Pattern 5: Multi-Entity Events

Events involving multiple related entities:

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", OnAfterSalesOrderPost, '', false, false)]
local procedure OnAfterSalesOrderPost(var SalesHeader: Record "Sales Header"; SalesInvHeader: Record "Sales Invoice Header")
var
  Customer: Record Customer;
begin
  if Customer.Get(SalesHeader."Sell-to Customer No.") then
    OnSalesOrderInvoiced(
      SalesInvHeader.SystemId,
      SalesInvHeader."No.",
      Customer.SystemId,
      Customer."No.",
      Customer.Name,
      SalesHeader."Order No.",
      SalesInvHeader.Amount
    );
end;

[ExternalBusinessEvent('salesOrderInvoiced', 'Sales Order Invoiced', 'Triggered when sales order is posted and invoiced', EventCategory::"Sales Management")]
procedure OnSalesOrderInvoiced(
  InvoiceID: GUID;
  InvoiceNo: Code[20];
  CustomerID: GUID;
  CustomerNo: Code[20];
  CustomerName: Text[100];
  OrderNo: Code[20];
  InvoiceAmount: Decimal
)
begin
end;
```

---

## Testing and Debugging

### Verify Events in BC

**Business Event Subscriptions** page shows all available business events:
```al
// Search for this page in BC
Page "Business Event Subscriptions"
```

**Business Event Activity Log** shows event firing history:
```al
// Use for debugging
Page "Business Event Activity Log"
```

**Business Event Notifications** shows notification queue:
```al
// See pending/sent notifications
Page "Business Event Notifications"
```

### Power Automate Testing Pattern

1. Create simple test flow with email notification
2. Configure trigger with your business event
3. Test in BC by performing business action
4. Verify flow executes in Power Automate run history
5. Check Business Event Activity Log in BC

### Transaction Rollback Scenario

Business events fire within transactions. If transaction rolls back, notification is cancelled:

```al
// ❌ This event notification will be cancelled if error occurs
procedure ProcessWithEvent()
begin
  // Do something...
  OnSomethingHappened();  // Event fires
  
  Error('Something went wrong');  // Transaction rolls back - event cancelled!
end;
```

**Best practice**: Ensure business events fire after all validation passes and before potential errors.

---

## Summary Checklist

When implementing business events, ensure:

- ✅ EventCategory enum extension created with descriptive category
- ✅ Business events codeunit created with meaningful name
- ✅ Event subscribers listen to appropriate internal events
- ✅ ExternalBusinessEvent procedures follow naming conventions
- ✅ Parameters include SystemId and business-relevant data only
- ✅ IntegrationEvent publishers added where needed (custom tables/codeunits)
- ✅ Events verified in "Business Event Subscriptions" page
- ✅ Tested with Power Automate cloud flow
- ✅ Event names are stable and business-focused
- ✅ Documentation includes when events fire and parameter meanings

---

**Remember**: Business events are long-term API contracts. Design them carefully with business semantics, stable parameters, and clear documentation—just like you would design a REST API.
