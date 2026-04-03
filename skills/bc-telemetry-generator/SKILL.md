---
name: bc-telemetry-generator
description: Instruments Business Central AL codeunits with Application Insights telemetry using the System Application Telemetry codeunit. Analyzes an existing codeunit supplied by the user, generates a dedicated Feature Usage Telemetry codeunit (or extends an existing one) with helper procedures for LogStart/LogEnd with automatic duration, LogError with call stack, LogFeatureUsage, and LogPerformanceWarning. Adds Telemetry.LogMessage calls with consistent event IDs (PREFIX-NNN), meaningful custom dimensions (Dictionary of [Text, Text]), proper Verbosity levels (Normal, Warning, Error, Critical), correct DataClassification (SystemMetadata, CustomerContent, EndUserIdentifiableInformation), and TelemetryScope::ExtensionPublisher. Covers five telemetry categories — lifecycle events (started/completed), error tracking (validation/posting failures), performance monitoring (slow operation warnings with threshold comparison), feature usage analytics (discount types, payment methods, order size distribution), and contextual telemetry (environment, version, anonymized user). Generates KQL queries for Application Insights analysis. Use when adding telemetry to codeunits, instrumenting AL code with Application Insights, tracking feature usage, monitoring performance, logging errors with custom dimensions, creating telemetry helper codeunits, or implementing observability for BC extensions.
---

# BC Telemetry Generator

Instruments Business Central AL codeunits with Application Insights telemetry. Analyzes a target codeunit, creates or extends a dedicated telemetry helper codeunit, and adds `Telemetry.LogMessage` calls following Microsoft best practices.

**Reference**: [alguidelines.dev — Adding Telemetry](https://alguidelines.dev/docs/agentic-coding/gettingmore/telemetry/)

## Prerequisites

- Target codeunit to instrument (user provides the codeunit)
- Available object ID for telemetry helper codeunit
- Extension prefix established (e.g., BCS)
- Application Insights configured in extension (or environment)

## Workflow

### Step 1: Read the Target Codeunit

Ask the user which codeunit to instrument. Read the file and identify:
- **Public procedures** — entry points needing start/end tracking
- **Validation procedures** — needing warning-level telemetry on failure
- **Error-prone operations** — posting, external calls, database writes
- **Performance-sensitive paths** — loops, bulk operations, external HTTP calls
- **Feature decision points** — discount type selection, payment method, routing logic

### Step 2: Plan Telemetry Strategy

For each identified procedure, determine:

| Category | Verbosity | When to Log |
|----------|-----------|-------------|
| Lifecycle (start/end) | Normal | Entry points, key milestones |
| Error | Error | Catch blocks, posting failures, validation errors |
| Warning | Warning | Validation failures, degraded paths |
| Performance | Warning | Operations exceeding threshold |
| Feature usage | Normal | Business decisions, option selections |

**Event ID scheme**: `[PREFIX]-[AREA][NNN]` for info, `[PREFIX]-[AREA]E[NNN]` for errors, `[PREFIX]-[AREA]W[NNN]` for warnings, `[PREFIX]-[AREA]P[NNN]` for performance.

Example: `BCS-SALES001`, `BCS-SALESE001`, `BCS-SALESW001`, `BCS-SALESP001`

### Step 3: Create or Extend Telemetry Helper Codeunit

Check if a telemetry helper already exists in the workspace. If so, add new procedures to it. If not, create one.

**File location**: Same feature folder as the target codeunit, or `Codeunit/` folder.

**Naming**: `[Prefix] [Feature] Telemetry` (e.g., `BCS Sales Telemetry`)

#### Telemetry Helper Structure

```al
codeunit [ID] "[Prefix] [Feature] Telemetry"
{
  Access = Internal;
  SingleInstance = true;

  var
    Telemetry: Codeunit Telemetry;

  procedure LogOperationStarted(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Normal, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogOperationCompleted(EventId: Text; Message: Text; StartTime: DateTime; CustomDimensions: Dictionary of [Text, Text])
  var
    DurationMs: Duration;
  begin
    DurationMs := CurrentDateTime - StartTime;
    CustomDimensions.Set('DurationMs', Format(DurationMs));
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Normal, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogError(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    CustomDimensions.Set('ErrorMessage', GetLastErrorText());
    CustomDimensions.Set('ErrorCallStack', GetLastErrorCallStack());
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Error, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogWarning(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Warning, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogFeatureUsage(EventId: Text; FeatureArea: Text; FeatureAction: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    CustomDimensions.Set('FeatureArea', FeatureArea);
    CustomDimensions.Set('FeatureAction', FeatureAction);
    Telemetry.LogMessage(
      EventId, FeatureArea + ' - ' + FeatureAction,
      Verbosity::Normal, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogPerformanceWarning(EventId: Text; OperationName: Text; DurationMs: Duration; ThresholdMs: Integer; CustomDimensions: Dictionary of [Text, Text])
  begin
    if DurationMs <= ThresholdMs then
      exit;

    CustomDimensions.Set('Operation', OperationName);
    CustomDimensions.Set('DurationMs', Format(DurationMs));
    CustomDimensions.Set('ThresholdMs', Format(ThresholdMs));
    Telemetry.LogMessage(
      EventId,
      StrSubstNo('Slow operation detected: %1 (%2 ms, threshold %3 ms)', OperationName, DurationMs, ThresholdMs),
      Verbosity::Warning, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;
}
```

### Step 4: Add Dimension Builder Procedures

For each entity involved, create a dimension builder that collects standard fields:

```al
local procedure AddOrderDimensions(var Dims: Dictionary of [Text, Text]; SalesHeader: Record "Sales Header")
begin
  Dims.Add('OrderNo', SalesHeader."No.");
  Dims.Add('CustomerNo', SalesHeader."Sell-to Customer No.");
  Dims.Add('DocumentType', Format(SalesHeader."Document Type"));
end;
```

**Rules for custom dimensions**:
- Use `CustomerContent` classification label for business data (order no, customer no, amounts)
- Use `SystemMetadata` for technical data (duration, counts, operation names)
- Use `EndUserIdentifiableInformation` for user references — **anonymize when possible**
- Never log passwords, API keys, credit card numbers, or PII
- Keep dimension count under 15 per event for readability

### Step 5: Instrument the Target Codeunit

Add telemetry calls to the target codeunit using the helper:

#### Lifecycle Events (Start/End)

```al
procedure ProcessOrder(var SalesHeader: Record "Sales Header"): Boolean
var
  BCStelemetry: Codeunit "BCS Sales Telemetry";
  CustomDimensions: Dictionary of [Text, Text];
  StartTime: DateTime;
begin
  StartTime := CurrentDateTime;
  AddOrderDimensions(CustomDimensions, SalesHeader);
  BCStelemetry.LogOperationStarted('BCS-SALES001', 'Order processing started', CustomDimensions);

  // ... existing logic ...

  Clear(CustomDimensions);
  AddOrderDimensions(CustomDimensions, SalesHeader);
  BCStelemetry.LogOperationCompleted('BCS-SALES002', 'Order processing completed', StartTime, CustomDimensions);
  exit(true);
end;
```

#### Error Tracking

```al
if not PostOrder(SalesHeader) then begin
  Clear(CustomDimensions);
  AddOrderDimensions(CustomDimensions, SalesHeader);
  BCStelemetry.LogError('BCS-SALESE001', 'Order posting failed', CustomDimensions);
  exit(false);
end;
```

#### Validation Warnings

```al
if Customer.Blocked <> Customer.Blocked::" " then begin
  Clear(CustomDimensions);
  CustomDimensions.Add('CustomerNo', SalesHeader."Sell-to Customer No.");
  CustomDimensions.Add('BlockedReason', Format(Customer.Blocked));
  BCStelemetry.LogWarning('BCS-SALESW001', 'Order validation failed: Customer blocked', CustomDimensions);
  Error('Customer %1 is blocked.', Customer."No.");
end;
```

#### Performance Monitoring

```al
StartTime := CurrentDateTime;
ValidateOrder(SalesHeader);
Duration := CurrentDateTime - StartTime;

BCStelemetry.LogPerformanceWarning(
  'BCS-SALESP001', 'ValidateOrder', Duration, 1000, CustomDimensions);
```

#### Feature Usage

```al
BCStelemetry.LogFeatureUsage(
  'BCS-FEAT001', 'Discounts', 'Line Discount Applied', CustomDimensions);
```

### Step 6: Build and Validate

- Run `al_build` to verify compilation
- Check `@problems` for errors
- Verify no sensitive data is logged

## Event ID Convention

| Pattern | Meaning | Example |
|---------|---------|---------|
| `PREFIX-AREA###` | Informational | `BCS-SALES001` |
| `PREFIX-AREAE###` | Error | `BCS-SALESE001` |
| `PREFIX-AREAW###` | Warning | `BCS-SALESW001` |
| `PREFIX-AREAP###` | Performance | `BCS-SALESP001` |
| `PREFIX-FEAT###` | Feature usage | `BCS-FEAT001` |

- Keep the AREA tag short (4-8 chars)
- Number sequentially within a category
- Maintain an event ID registry comment at the top of the telemetry codeunit

## DataClassification Rules

| Data Type | Classification | Examples |
|-----------|---------------|----------|
| Technical metrics | SystemMetadata | Duration, counts, operation name |
| Business identifiers | CustomerContent | Order No., Customer No., amounts |
| User references | EndUserIdentifiableInformation | User ID (anonymize!) |
| Sensitive data | **NEVER LOG** | Passwords, API keys, credit cards |

## Best Practices

1. **Don't over-log** — log entry/exit of key operations, not every line
2. **Use consistent event IDs** — prefix + area + sequential number
3. **Include helpful dimensions** — enough to diagnose issues, not everything
4. **Clear dimensions before reuse** — call `Clear(CustomDimensions)` between events
5. **Log at appropriate verbosity** — Normal for info, Warning for degraded paths, Error for failures
6. **Always use TelemetryScope::ExtensionPublisher** — routes to your Application Insights
7. **Keep dimension values short** — Application Insights truncates at ~8 KB per event
8. **Never log PII** — anonymize user IDs, never log passwords or tokens
9. **Add duration to completion events** — essential for performance analysis
10. **Leave telemetry helper body empty for feature usage** — just add dimensions and call helper

## Advanced Patterns

- **Telemetry wrapper codeunit**: See [references/telemetry-reference.md](references/telemetry-reference.md#telemetry-wrapper-pattern)
- **Contextual telemetry** (environment, version): See [references/telemetry-reference.md](references/telemetry-reference.md#contextual-telemetry)
- **KQL queries for Application Insights**: See [references/kql-queries.md](references/kql-queries.md)

## External References

- [alguidelines.dev — Adding Telemetry](https://alguidelines.dev/docs/agentic-coding/gettingmore/telemetry/)
- [Microsoft Docs — Telemetry Codeunit](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-instrument-application-for-telemetry)
- [Microsoft Docs — Custom Telemetry Signals](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/telemetry-custom-signal-trace)
- [Microsoft Docs — Application Insights for Extensions](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-application-insights-for-extensions)
