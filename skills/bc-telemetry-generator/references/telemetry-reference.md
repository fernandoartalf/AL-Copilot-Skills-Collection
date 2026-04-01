# Telemetry Reference Patterns

Advanced patterns for Application Insights telemetry in Business Central extensions.

## Telemetry Wrapper Pattern

A `SingleInstance` codeunit that centralizes all telemetry calls and adds common context automatically.

### Full Wrapper Codeunit

```al
codeunit [ID] "[Prefix] Telemetry Wrapper"
{
  Access = Internal;
  SingleInstance = true;

  var
    Telemetry: Codeunit Telemetry;
    CommonDimensionsInitialized: Boolean;
    ExtensionVersion: Text[50];

  // ── Lifecycle ──

  procedure LogStart(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Normal, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogEnd(EventId: Text; Message: Text; StartTime: DateTime; CustomDimensions: Dictionary of [Text, Text])
  var
    DurationMs: Duration;
  begin
    DurationMs := CurrentDateTime - StartTime;
    CustomDimensions.Set('DurationMs', Format(DurationMs));
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Normal, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  // ── Errors ──

  procedure LogError(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    CustomDimensions.Set('ErrorMessage', GetLastErrorText());
    CustomDimensions.Set('ErrorCallStack', GetLastErrorCallStack());
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Error, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  procedure LogErrorWithDetails(EventId: Text; Message: Text; ErrorDetails: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    CustomDimensions.Set('ErrorDetails', ErrorDetails);
    CustomDimensions.Set('ErrorCallStack', GetLastErrorCallStack());
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Error, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  // ── Warnings ──

  procedure LogWarning(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId, Message,
      Verbosity::Warning, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  // ── Feature Usage ──

  procedure LogFeatureUsage(EventId: Text; FeatureArea: Text; FeatureAction: Text; CustomDimensions: Dictionary of [Text, Text])
  begin
    CustomDimensions.Set('FeatureArea', FeatureArea);
    CustomDimensions.Set('FeatureAction', FeatureAction);
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId, FeatureArea + ' - ' + FeatureAction,
      Verbosity::Normal, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  // ── Performance ──

  procedure LogPerformanceWarning(EventId: Text; OperationName: Text; DurationMs: Duration; ThresholdMs: Integer; CustomDimensions: Dictionary of [Text, Text])
  begin
    if DurationMs <= ThresholdMs then
      exit;

    CustomDimensions.Set('Operation', OperationName);
    CustomDimensions.Set('DurationMs', Format(DurationMs));
    CustomDimensions.Set('ThresholdMs', Format(ThresholdMs));
    AddCommonDimensions(CustomDimensions);
    Telemetry.LogMessage(
      EventId,
      StrSubstNo('Slow operation detected: %1 (%2 ms, threshold %3 ms)', OperationName, DurationMs, ThresholdMs),
      Verbosity::Warning, DataClassification::SystemMetadata,
      TelemetryScope::ExtensionPublisher, CustomDimensions);
  end;

  // ── Common Dimensions ──

  local procedure AddCommonDimensions(var CustomDimensions: Dictionary of [Text, Text])
  var
    ModuleInfo: ModuleInfo;
    EnvironmentInformation: Codeunit "Environment Information";
  begin
    if not CommonDimensionsInitialized then
      InitCommonDimensions();

    CustomDimensions.Set('ExtensionVersion', ExtensionVersion);
    CustomDimensions.Set('CompanyName', CompanyName);

    if EnvironmentInformation.IsSaaS() then
      CustomDimensions.Set('EnvironmentType', 'SaaS')
    else
      CustomDimensions.Set('EnvironmentType', 'OnPrem');

    if EnvironmentInformation.IsProduction() then
      CustomDimensions.Set('EnvironmentName', 'Production')
    else
      CustomDimensions.Set('EnvironmentName', 'Sandbox');
  end;

  local procedure InitCommonDimensions()
  var
    ModuleInfo: ModuleInfo;
  begin
    NavApp.GetCurrentModuleInfo(ModuleInfo);
    ExtensionVersion := Format(ModuleInfo.AppVersion);
    CommonDimensionsInitialized := true;
  end;
}
```

### Usage

```al
var
  TelemetryWrapper: Codeunit "[Prefix] Telemetry Wrapper";
  Dims: Dictionary of [Text, Text];
  StartTime: DateTime;
begin
  StartTime := CurrentDateTime;
  Dims.Add('OrderNo', SalesHeader."No.");
  TelemetryWrapper.LogStart('BCS-SALES001', 'Processing order', Dims);

  // ... logic ...

  Clear(Dims);
  Dims.Add('OrderNo', SalesHeader."No.");
  TelemetryWrapper.LogEnd('BCS-SALES002', 'Order processed', StartTime, Dims);
end;
```

## Contextual Telemetry

Automatically add environment and version context to all telemetry signals.

### Environment Detection

```al
local procedure GetEnvironmentType(): Text
var
  EnvironmentInformation: Codeunit "Environment Information";
begin
  if EnvironmentInformation.IsSaaS() then begin
    if EnvironmentInformation.IsProduction() then
      exit('SaaS-Production')
    else
      exit('SaaS-Sandbox');
  end else
    exit('OnPrem');
end;
```

### Extension Version

```al
local procedure GetExtensionVersion(): Text
var
  ModuleInfo: ModuleInfo;
begin
  NavApp.GetCurrentModuleInfo(ModuleInfo);
  exit(Format(ModuleInfo.AppVersion));
end;
```

### Anonymized User Context

**Never log plain user IDs.** Anonymize for aggregation:

```al
local procedure GetAnonymizedUserId(): Text
var
  CryptographyManagement: Codeunit "Cryptography Management";
begin
  // Hash the user security ID for anonymization
  exit(CryptographyManagement.GenerateHash(UserSecurityId(), 2)); // SHA256
end;
```

## Telemetry Constants Pattern

Keep all event IDs and messages as labels for consistency and translatability:

```al
codeunit [ID] "[Prefix] Telemetry Constants"
{
  Access = Internal;

  var
    // ── Event IDs ──
    SalesOrderStartedEventIdLbl: Label 'BCS-SALES001', Locked = true;
    SalesOrderCompletedEventIdLbl: Label 'BCS-SALES002', Locked = true;
    SalesOrderErrorEventIdLbl: Label 'BCS-SALESE001', Locked = true;
    SalesOrderValidationWarnEventIdLbl: Label 'BCS-SALESW001', Locked = true;
    SalesOrderSlowEventIdLbl: Label 'BCS-SALESP001', Locked = true;

    // ── Messages ──
    SalesOrderStartedMsgLbl: Label 'Sales order processing started', Locked = true;
    SalesOrderCompletedMsgLbl: Label 'Sales order processing completed', Locked = true;
    SalesOrderErrorMsgLbl: Label 'Sales order processing failed', Locked = true;
    SalesOrderValidationWarnMsgLbl: Label 'Sales order validation warning: %1', Locked = true;
}
```

**Benefits**:
- Single source of truth for all event IDs
- Easy to search and audit
- `Locked = true` prevents translation (event IDs must stay stable)

## TryFunction Pattern with Telemetry

Wrap error-prone operations in TryFunctions and log failures:

```al
[TryFunction]
local procedure TryPostOrder(var SalesHeader: Record "Sales Header")
var
  SalesPost: Codeunit "Sales-Post";
begin
  SalesPost.Run(SalesHeader);
end;

procedure PostOrderWithTelemetry(var SalesHeader: Record "Sales Header"): Boolean
var
  BCStelemetry: Codeunit "BCS Sales Telemetry";
  CustomDimensions: Dictionary of [Text, Text];
  StartTime: DateTime;
begin
  StartTime := CurrentDateTime;

  if not TryPostOrder(SalesHeader) then begin
    AddOrderDimensions(CustomDimensions, SalesHeader);
    BCStelemetry.LogError('BCS-SALESE001', 'Order posting failed', CustomDimensions);
    exit(false);
  end;

  Clear(CustomDimensions);
  AddOrderDimensions(CustomDimensions, SalesHeader);
  BCStelemetry.LogOperationCompleted('BCS-SALES002', 'Order posted', StartTime, CustomDimensions);
  exit(true);
end;
```

## Conditional Telemetry Pattern

Enable/disable telemetry per module via setup table:

```al
// In setup table
field(10; "Enable Telemetry"; Boolean)
{
  Caption = 'Enable Telemetry';
  DataClassification = CustomerContent;
  InitValue = true;
}

// In telemetry helper
procedure IsEnabled(): Boolean
var
  Setup: Record "[Prefix] Setup";
begin
  if not Setup.Get() then
    exit(true); // Default to enabled
  exit(Setup."Enable Telemetry");
end;

procedure LogStart(EventId: Text; Message: Text; CustomDimensions: Dictionary of [Text, Text])
begin
  if not IsEnabled() then
    exit;

  Telemetry.LogMessage(
    EventId, Message,
    Verbosity::Normal, DataClassification::SystemMetadata,
    TelemetryScope::ExtensionPublisher, CustomDimensions);
end;
```

## Bulk Operation Telemetry

For batch/bulk operations, log summary instead of individual items:

```al
procedure ProcessBatch(var ItemJnlBatch: Record "Item Journal Batch")
var
  BCStelemetry: Codeunit "BCS Inventory Telemetry";
  CustomDimensions: Dictionary of [Text, Text];
  StartTime: DateTime;
  SuccessCount: Integer;
  ErrorCount: Integer;
begin
  StartTime := CurrentDateTime;

  // Process items ...
  // Increment SuccessCount / ErrorCount per item

  CustomDimensions.Add('BatchName', ItemJnlBatch.Name);
  CustomDimensions.Add('TotalItems', Format(SuccessCount + ErrorCount));
  CustomDimensions.Add('SuccessCount', Format(SuccessCount));
  CustomDimensions.Add('ErrorCount', Format(ErrorCount));

  BCStelemetry.LogOperationCompleted(
    'BCS-INV002', 'Batch processing completed', StartTime, CustomDimensions);

  if ErrorCount > 0 then begin
    Clear(CustomDimensions);
    CustomDimensions.Add('BatchName', ItemJnlBatch.Name);
    CustomDimensions.Add('ErrorCount', Format(ErrorCount));
    BCStelemetry.LogWarning(
      'BCS-INVW001', StrSubstNo('Batch had %1 errors', ErrorCount), CustomDimensions);
  end;
end;
```

## Amount Range Helper

Bucket amounts into ranges for analytics without exposing exact figures:

```al
local procedure GetAmountRange(Amount: Decimal): Text
begin
  case true of
    Amount < 100:
      exit('0-100');
    Amount < 1000:
      exit('100-1K');
    Amount < 10000:
      exit('1K-10K');
    Amount < 100000:
      exit('10K-100K');
    else
      exit('100K+');
  end;
end;
```

Use in dimensions:
```al
CustomDimensions.Add('AmountRange', GetAmountRange(SalesHeader."Amount Including VAT"));
```

## HttpClient Telemetry

For external API integrations, log request/response metadata:

```al
procedure CallExternalAPI(Endpoint: Text): Boolean
var
  BCStelemetry: Codeunit "BCS Integration Telemetry";
  Client: HttpClient;
  Response: HttpResponseMessage;
  CustomDimensions: Dictionary of [Text, Text];
  StartTime: DateTime;
begin
  StartTime := CurrentDateTime;
  CustomDimensions.Add('Endpoint', Endpoint);
  CustomDimensions.Add('Method', 'GET');
  BCStelemetry.LogOperationStarted('BCS-API001', 'External API call started', CustomDimensions);

  if not Client.Get(Endpoint, Response) then begin
    Clear(CustomDimensions);
    CustomDimensions.Add('Endpoint', Endpoint);
    BCStelemetry.LogError('BCS-APIE001', 'External API call failed', CustomDimensions);
    exit(false);
  end;

  Clear(CustomDimensions);
  CustomDimensions.Add('Endpoint', Endpoint);
  CustomDimensions.Add('StatusCode', Format(Response.HttpStatusCode));
  CustomDimensions.Add('IsSuccess', Format(Response.IsSuccessStatusCode));
  BCStelemetry.LogOperationCompleted('BCS-API002', 'External API call completed', StartTime, CustomDimensions);

  exit(Response.IsSuccessStatusCode);
end;
```

## Testing Telemetry

Verify telemetry is emitted correctly in test codeunits:

```al
[Test]
procedure TestTelemetryEmittedOnOrderProcessing()
var
  SalesHeader: Record "Sales Header";
  SalesOrderProcessor: Codeunit "Sales Order Processor";
begin
  // [GIVEN] A valid sales order
  CreateSalesOrder(SalesHeader);

  // [WHEN] Processing the order
  SalesOrderProcessor.ProcessOrder(SalesHeader);

  // [THEN] No error occurs and the operation completes
  // Telemetry verification is done via Application Insights,
  // not in unit tests. Here we just verify no runtime errors.
end;
```

**Note**: AL does not provide a built-in way to assert telemetry emissions in test codeunits. Verify telemetry in Application Insights using KQL queries after deployment.
