---
name: bc-business-events-generator
description: Implements external business events for Business Central enabling Power Automate and external system integrations. Creates EventCategory enum extensions with custom categories, business events codeunit with ExternalBusinessEvent attribute procedures (eventName, displayName, description, category parameters), event subscriber procedures listening to IntegrationEvent publishers, and IntegrationEvent publishers in table extensions or codeunits for lifecycle triggers (OnAfterInsert, OnAfterModify, OnBeforePost). Follows event-driven architecture separating technical events from business semantics. Integrates with Business Event Subscriptions, Business Event Activity Log, Business Event Notifications for debugging and monitoring. Supports GUID-based entity tracking, meaningful parameter passing (SystemId, key fields, business relevant data), and proper transaction handling. Use when creating business events for Power Automate triggers, implementing external integrations, exposing BC events to Dataverse, building event-driven workflows, adding webhook capabilities, enabling low-code automation triggers, or connecting BC to Power Platform cloud flows with automated triggers.
---

# BC Business Events Generator

Implements external business events for Microsoft Dynamics 365 Business Central, enabling event-driven integrations with Power Automate, Dataverse, and external systems.

## Overview

This skill generates the complete structure for Business Central external business events following BC best practices. Business events expose meaningful business semantics (not technical triggers) that external systems can subscribe to via Power Automate cloud flows, webhooks, or other integration platforms.

**What you get**:
- EventCategory enum extension for custom event categorization
- Business Events codeunit with ExternalBusinessEvent procedures
- Event subscriber procedures bridging internal events to external events
- IntegrationEvent publishers in appropriate table extensions or codeunits
- Proper parameter design with SystemId and business-relevant data
- Integration with BC's Business Event Subscriptions page
- Activity logging for debugging and monitoring

**Key principle**: Business events represent business decisions, not technical changes. If you can't explain it to a business user in one sentence, it's not a business event.

## When to Use This Skill

Invoke this skill when you need to:
- Create external business events for Power Automate triggers
- Implement event-driven integrations between BC and external systems
- Expose BC business logic to Power Platform cloud flows
- Add webhook capabilities to custom or standard BC tables
- Enable low-code automation scenarios with BC as event source
- Connect BC to Dataverse with business event triggers
- Implement automated notifications for business process milestones
- Build event-driven architectures separating business semantics from technical implementation

**Trigger phrases**:
- "create business event for [entity/process]"
- "add Power Automate trigger"
- "implement external business event"
- "expose [action] as business event"
- "create event for Power Automate"
- "add webhook for [entity]"
- "implement event-driven integration"

## Prerequisites

Before using this skill, ensure:
- ✅ You have identified a clear business event (describable to business users in one sentence)
- ✅ You know the source of the event (table insert/modify, posting process, etc.)
- ✅ You have identified relevant parameters (SystemId, key fields, business data)
- ✅ You understand the transaction context (when the event should fire)
- ✅ You have a custom object ID range for enum values and codeunits

**Not a business event** if it's:
- ❌ Every field change (`OnAfterModify` without business context)
- ❌ Technical triggers without business meaning
- ❌ "Just in case someone needs it" events
- ❌ Events that require understanding BC internals to use

## Implementation Workflow

### Step 1: Define Business Event Semantics

Articulate the business event in a single, clear sentence from a business perspective:
- ✅ "Customer was blocked due to credit limit"
- ✅ "Sales order was released for shipping"
- ✅ "Statistical account was created"
- ❌ "Record was inserted in Customer table" (too technical)

**Define parameters**: Include SystemId for entity tracking, key fields for identification, and business-relevant data (not all fields).

### Step 2: Identify Event Source

Determine where the business event originates:
- **Table lifecycle**: `OnAfterInsert`, `OnAfterModify`, `OnAfterDelete`, `OnAfterRename`
- **Posting processes**: Existing events in posting codeunits (e.g., `Codeunit::"Sales-Post"`)
- **Custom processes**: Your own business logic codeunits
- **Standard BC events**: Subscribe to existing IntegrationEvents

**Decision**: If the source is a custom table you control, add IntegrationEvent publisher. If it's standard BC or external extension, subscribe to existing events.

### Step 3: Create EventCategory Enum Extension

Generate an enum extension to add your custom event category. BC requires custom categories for external business events (cannot use standard categories).

**Naming**: Use descriptive category names (e.g., "BCS Stat. Accounts", "Custom Sales", "Inventory Mgmt")

**Object ID**: Use your extension's object ID range

See [references/code-templates.md](references/code-templates.md#enum-extension-event-category) for complete template.

### Step 4: Create Business Events Codeunit

Create a dedicated codeunit for your business events. This codeunit contains:
- Event subscriber procedures (listen to internal events)
- ExternalBusinessEvent procedures (the actual business events)

**Naming convention**: `[Prefix] Business Events`

**Single Responsibility**: One codeunit per logical business area or feature

See [references/code-templates.md](references/code-templates.md#business-events-codeunit-structure) for structure.

### Step 5: Implement Event Subscriber Procedures

For each business event, create an event subscriber that:
1. Subscribes to the source event (IntegrationEvent, table trigger via event, or standard BC event)
2. Extracts relevant business data from the event parameters
3. Calls the corresponding ExternalBusinessEvent procedure

**Pattern**: Keep subscriber logic minimal—just data extraction and business event invocation.

See [references/code-templates.md](references/code-templates.md#event-subscriber-pattern) for templates.

### Step 6: Implement ExternalBusinessEvent Procedures

For each business event, create a procedure decorated with `[ExternalBusinessEvent]` attribute:

```al
[ExternalBusinessEvent('eventName', 'display name', 'description', EventCategory::"Your Category")]
procedure OnYourBusinessEvent(EntityID: GUID; KeyField: Code[20]; RelevantData: Text[100])
begin
end;
```

**Attribute parameters**:
- `eventName`: Lowercase, no spaces, camelCase (e.g., 'customerBlocked', 'orderReleased')
- `display name`: Human-readable short description
- `description`: Full sentence explaining when this fires
- `category`: Your custom EventCategory enum value

**Procedure body**: Leave empty—the attribute handles external invocation.

See [references/code-templates.md](references/code-templates.md#external-business-event-procedures) for patterns.

### Step 7: Add IntegrationEvent Publishers (If Needed)

If you're exposing events from your own custom tables or codeunits, add IntegrationEvent publishers:

```al
[IntegrationEvent(false, false)]
local procedure OnAfterCustomOperation(var YourRecord: Record "Your Table")
begin
end;
```

**When to add**:
- ✅ Custom table lifecycle events (in table extension triggers)
- ✅ Custom business logic in your codeunits
- ❌ Don't add if subscribing to existing BC events

**Invoke**: Call the IntegrationEvent from appropriate triggers or procedures.

See [references/code-templates.md](references/code-templates.md#integration-event-publishers) for examples.

### Step 8: Design Parameter Lists Carefully

Business event parameters should be:
- **Minimal**: Only data needed by external systems
- **Stable**: Avoid internal implementation details
- **Business-focused**: Key fields and business semantics
- **GUID-based**: Always include SystemId for entity tracking

**Good parameters**:
```al
procedure OnCustomerBlocked(CustomerID: GUID; CustomerNo: Code[20]; BlockedReason: Enum "Customer Blocked")
```

**Avoid**:
```al
procedure OnCustomerChange(var Customer: Record Customer) // Passes entire record
```

### Step 9: Build and Publish Extension

After implementing all components:
1. Build the extension to verify compilation
2. Publish to target environment
3. Verify event appears in Business Event Subscriptions page

**Verification**: Search page "Business Event Subscriptions" → should see your events listed under your custom category.

### Step 10: Test with Power Automate

Create a test cloud flow in Power Automate:
1. In Dataverse solution, create new automated cloud flow
2. Select "When a Business Central event occurs" trigger
3. Select your BC environment and company
4. Find your custom business event in the list
5. Add test action (e.g., send email notification)
6. Trigger the business event in BC
7. Verify flow execution in Power Automate run history

**Debugging**: Use "Business Event Notifications" and "Business Event Activity Log" pages in BC.

### Step 11: Monitor Business Event Activity

BC provides built-in monitoring:
- **Business Event Subscriptions**: Lists all active subscriptions (Power Automate connections)
- **Business Event Notifications**: Shows notification queue
- **Business Event Activity Log**: Detailed logs of event firing and delivery status

**Access**: Search for these pages in BC to monitor and debug events.

**Important**: Events fire within transactions—if BC transaction rolls back, the event notification is also cancelled.

### Step 12: Document Business Events

Document each business event for consumers:
- When it fires (business condition)
- What parameters mean
- Example use cases
- Transaction behavior
- Any caveats or limitations

**Tip**: Business events are API contracts—treat them with the same versioning discipline as REST APIs.

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Business Central                        │
│                                                              │
│  ┌──────────────────┐                                       │
│  │ Table Extension  │  (OnAfterInsert trigger)              │
│  │ or BC Posting    │                                        │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │ IntegrationEvent │  (Internal event publisher)           │
│  │ Publisher        │                                        │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────┐                  │
│  │ Business Events Codeunit              │                  │
│  │                                       │                  │
│  │  [EventSubscriber]                    │                  │
│  │  procedure OnInternalEvent()          │                  │
│  │    ↓                                  │                  │
│  │    Call business event                │                  │
│  │    ↓                                  │                  │
│  │  [ExternalBusinessEvent]              │                  │
│  │  procedure OnBusinessEvent()          │                  │
│  │                                       │                  │
│  └────────┬──────────────────────────────┘                  │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │ Business Event   │  (BC framework)                       │
│  │ Subscriptions    │                                        │
│  └────────┬─────────┘                                       │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │  Power Automate    │  (External consumer)
   │  Dataverse         │
   │  Webhooks          │
   └────────────────────┘
```

## Best Practices

### Event Design
- **Business semantics**: Events should make sense to business users
- **Stable contracts**: Design for longevity—breaking changes impact external flows
- **Minimal parameters**: Only include necessary business data
- **SystemId tracking**: Always include GUID for reliable entity tracking

### Transaction Awareness
- **Commit timing**: Events fire in transaction—rollback cancels notification
- **No Commit after event**: Never use Commit() after business event within same transaction
- **Async nature**: External systems receive event after BC transaction commits

### Naming Conventions
- **eventName**: camelCase, descriptive, business-focused (e.g., 'invoicePosted', 'customerCreated')
- **DisplayName**: Human-readable, concise
- **Description**: Complete sentence explaining trigger condition
- **Category**: Logical grouping for your extension area

### Separation of Concerns
- **IntegrationEvent**: Internal extensibility within BC
- **EventSubscriber**: Bridge between internal and external
- **ExternalBusinessEvent**: External API contract

## Troubleshooting

### Event Not Appearing in Power Automate

**Symptoms**: Custom business event doesn't show in Power Automate trigger list

**Causes**:
- Business Central extension not published correctly
- EventCategory enum extension missing or not compiled
- BC environment not connected to Dataverse/Power Platform

**Solutions**:
1. Verify extension is published: Check Extensions page in BC
2. Verify event appears in "Business Event Subscriptions" page
3. Ensure BC environment has Dataverse connection configured
4. Republish extension and restart BC service if needed

### Event Fires But Flow Doesn't Execute

**Symptoms**: Business Event Activity Log shows event fired, but Power Automate flow doesn't run

**Debug steps**:
1. Check "Business Event Notifications" page for notification status
2. Verify flow is turned on in Power Automate
3. Check flow run history for errors
4. Verify BC environment and company match in flow trigger
5. Check Power Automate service health

**Transaction rollback**: If BC code errors after business event, transaction rollback cancels notification.

### Event Fires Multiple Times

**Symptoms**: Same business event fires repeatedly for single business action

**Causes**:
- Event subscriber called in loop without guard condition
- Multiple subscribers to same IntegrationEvent all calling business event
- Recursive trigger execution

**Solutions**:
- Add IsHandled pattern to IntegrationEvent publisher
- Ensure event subscribers have proper conditions
- Review trigger placement in table extensions

### Parameters Showing Incorrect Values

**Symptoms**: Power Automate receives empty or wrong parameter values

**Causes**:
- Subscribing to event before record is fully populated
- Using xRec values instead of Rec values
- Transaction timing issues

**Solutions**:
- Use `OnAfter` events rather than `OnBefore` when possible
- Verify record variable has values at time of business event call
- Check field validation and triggers execution order

### Permission Errors

**Symptoms**: Events don't fire for some users

**Causes**:
- Missing execute permissions on business events codeunit
- Missing read permissions on accessed tables

**Solutions**:
- Generate and assign permission set for your extension
- Include codeunit execute permissions for business events codeunit
- Test with users having appropriate permission sets

## Advanced Patterns

### Conditional Business Events

Fire business events only when specific business conditions met:

```al
[EventSubscriber(ObjectType::Table, Database::Customer, OnAfterModifyEvent, '', false, false)]
local procedure OnCustomerModified(var Rec: Record Customer; var xRec: Record Customer)
begin
    // Only fire if blocked status changed
    if Rec.Blocked <> xRec.Blocked then
        OnCustomerBlockedStatusChanged(Rec.SystemId, Rec."No.", Rec.Blocked);
end;
```

### Batch Operation Events

For posting or batch processes, consider aggregated events:

```al
procedure OnBatchPosted(PostedCount: Integer; FailedCount: Integer; BatchID: GUID)
```

Rather than individual events for each posted record.

### Error Context

Include error details in business events for failure scenarios:

```al
[ExternalBusinessEvent('orderPostingFailed', 'Order Posting Failed', 'Triggered when sales order posting fails', EventCategory::"Custom Sales")]
procedure OnOrderPostingFailed(OrderID: GUID; OrderNo: Code[20]; ErrorMessage: Text[250])
begin
end;
```

## References

- [Code Templates](references/code-templates.md) - Complete AL code examples
- [AL Events Guidelines](.github/instructions/al-events.instructions.md) - Internal event patterns
- [BC Documentation - Business Events](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-events-discoverability)

## Related Skills

- **bc-api-page-generator**: For RESTful API integration patterns
- **skill-events**: For internal AL event patterns and publishers/subscribers
- **skill-api**: For general BC API development guidance

---

**Remember**: Business events are not technical triggers—they represent business decisions worth communicating outside Business Central. Design for stability, clarity, and business semantics.
