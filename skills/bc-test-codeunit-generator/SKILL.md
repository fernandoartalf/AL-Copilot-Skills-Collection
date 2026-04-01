---
name: bc-test-codeunit-generator
description: Generates test codeunits (Subtype = Test) for Business Central extensions that verify existing module functionality including page navigation, codeunit logic, setup validation, and data operations. Creates test codeunits with [Test] attribute methods following Given/When/Then naming, handler methods ([MessageHandler], [ConfirmHandler], [PageHandler], [ModalPageHandler], [HyperlinkHandler], [SendNotificationHandler], [RecallNotificationHandler], [RequestPageHandler], [ReportHandler], [FilterPageHandler], [StrMenuHandler], [SessionSettingsHandler]), Library Assert and Library Variable Storage integration, test data factories, and standard BC test library codeunits (Library - Sales, Library - ERM, Library - Inventory, Library - Random). Also creates or updates a TestRunner codeunit (Subtype = TestRunner) with OnBeforeTestRun/OnAfterTestRun triggers, TestIsolation property, and automatic registration of test codeunits. Use when asked to create tests for a module, generate test codeunits, write unit tests, add test coverage, create a test runner, build automated tests, implement test methods, or add testing infrastructure for a Business Central extension.
---

# Business Central Test Codeunit Generator

Generates production-ready test codeunits and test runner codeunits for Business Central extensions. Tests existing module functionality including page navigation, codeunit operations, setup validation, and data integrity.

## Overview

Test codeunits (`Subtype = Test`) contain test methods that verify module behavior. Each test method runs in its own database transaction (rolled back after execution by default). Test runner codeunits (`Subtype = TestRunner`) manage execution of test codeunits and integrate with test management frameworks.

This skill generates:
- Test codeunits with `[Test]` attribute methods
- Handler methods for UI automation (`[MessageHandler]`, `[ConfirmHandler]`, `[PageHandler]`, `[ModalPageHandler]`)
- Test runner codeunits with `OnBeforeTestRun`/`OnAfterTestRun` triggers
- Integration with standard BC test libraries (`Library Assert`, `Library - Sales`, `Library - ERM`, `Library - Inventory`, `Library - Random`)
- Given/When/Then test naming convention
- Test data factory patterns

**Complete examples and patterns**: [references/test-examples.md](references/test-examples.md)

## Prerequisites

- AL workspace with established object ID range and prefix
- Test project with separate `app.json` referencing the App project as a dependency
- Test framework dependencies declared in test project `app.json`:
  - `dd0be2ea-f733-4d65-bb34-a28f4624fb14` — Library Assert
  - `e7320ebb-08b3-4e1e-8c4b-37ae5bb1f994` — Library Variable Storage
  - `5d86850b-0d76-4eca-bd7b-951ad998e997` — Any (test runner)
  - `9856ae4f-d1a7-46ef-89bb-6ef056398228` — System Application Test Library
- Existing module objects (tables, pages, codeunits) to test

## Test Method Types

| Attribute | Purpose | Behavior |
|-----------|---------|----------|
| `[Test]` | Main test method | Runs as a test case, reported as pass/fail |
| `[MessageHandler]` | Handles `Message()` calls | Receives message text, validates with `Library Assert` |
| `[ConfirmHandler]` | Handles `Confirm()` dialogs | Returns reply boolean, validates question text |
| `[PageHandler]` | Handles `Page.Run()` on non-modal pages | Receives page instance for interaction |
| `[ModalPageHandler]` | Handles `Page.RunModal()` on modal pages | Receives page instance, simulates OK/Cancel |
| `[HyperlinkHandler]` | Handles `Hyperlink()` calls | Receives URL string |
| `[SendNotificationHandler]` | Handles `Notification.Send()` | Receives notification, validates message |
| `[RecallNotificationHandler]` | Handles `Notification.Recall()` | Receives notification being recalled |
| `[RequestPageHandler]` | Handles report request pages | Sets report parameters |
| `[ReportHandler]` | Handles `Report.Run()` | Receives report instance |
| `[FilterPageHandler]` | Handles filter page dialogs | Sets filter values |
| `[StrMenuHandler]` | Handles `StrMenu()` calls | Sets menu choice |
| `[SessionSettingsHandler]` | Handles session settings update | Controls session restart |
| `[Normal]` | Helper method | Regular procedure for test setup/utilities |

## Quick Start — Test Codeunit

```al
codeunit [TestID] "[Prefix] [Feature] Tests"
{
  Subtype = Test;

  var
    Assert: Codeunit "Library Assert";
    LibraryVariableStorage: Codeunit "Library Variable Storage";
    IsInitialized: Boolean;

  local procedure Initialize()
  begin
    LibraryVariableStorage.Clear();
    if IsInitialized then
      exit;

    // One-time test setup
    IsInitialized := true;
    Commit();
  end;

  [Test]
  procedure GivenSetup_WhenOpenSetupPage_ThenPageOpens()
  var
    SetupPage: TestPage "[Prefix] Module Setup";
  begin
    // [GIVEN] Module is installed
    Initialize();

    // [WHEN] Setup page is opened
    SetupPage.OpenEdit();

    // [THEN] Page opens without error
    SetupPage.Close();
  end;
}
```

## Quick Start — Test Runner Codeunit

```al
codeunit [RunnerID] "[Prefix] Test Runner"
{
  Subtype = TestRunner;
  TestIsolation = Codeunit;

  trigger OnRun()
  begin
    // Run test codeunits
    Codeunit.Run(Codeunit::"[Prefix] [Feature] Tests");
  end;

  trigger OnBeforeTestRun(
    CodeunitId: Integer;
    CodeunitName: Text;
    FunctionName: Text;
    Permissions: TestPermissions): Boolean
  begin
    exit(true);
  end;

  trigger OnAfterTestRun(
    CodeunitId: Integer;
    CodeunitName: Text;
    FunctionName: Text;
    Permissions: TestPermissions;
    IsSuccess: Boolean)
  begin
  end;
}
```

## Test Naming Convention

Follow **Given/When/Then** pattern:

```
[Given<Precondition>]_When<Action>_Then<ExpectedResult>
```

Examples:
- `GivenValidCustomer_WhenCreatingOrder_ThenOrderIsCreated`
- `GivenSetupRecord_WhenOpenSetupPage_ThenFieldsAreVisible`
- `GivenBlankSetup_WhenRunInstall_ThenSetupRecordExists`
- `GivenStatAccount_WhenPostJournal_ThenLedgerEntryCreated`

## Test Categories

### 1. Setup and Configuration Tests

Verify setup table initialization, default values, and page navigation:

```al
[Test]
procedure GivenFirstInstall_WhenOpenSetup_ThenRecordCreated()
var
  Setup: Record "[Prefix] Module Setup";
  SetupPage: TestPage "[Prefix] Module Setup";
begin
  Initialize();

  // [GIVEN] No setup record
  Setup.DeleteAll();

  // [WHEN] Open setup page
  SetupPage.OpenEdit();

  // [THEN] Setup record auto-created
  Assert.IsTrue(Setup.Get(), 'Setup record should be created on page open');
  SetupPage.Close();
end;
```

### 2. Page Navigation Tests

Verify pages open, fields display correctly, and actions work:

```al
[Test]
procedure GivenModule_WhenOpenListPage_ThenPageOpens()
var
  ListPage: TestPage "[Prefix] Record List";
begin
  Initialize();

  // [WHEN] Open list page
  ListPage.OpenView();

  // [THEN] Page opens without error
  ListPage.Close();
end;

[Test]
procedure GivenRecordExists_WhenOpenCardPage_ThenFieldsPopulated()
var
  MyRecord: Record "[Prefix] My Record";
  CardPage: TestPage "[Prefix] My Record Card";
begin
  Initialize();

  // [GIVEN] Record exists
  CreateTestRecord(MyRecord);

  // [WHEN] Open card for record
  CardPage.OpenEdit();
  CardPage.GoToRecord(MyRecord);

  // [THEN] Fields are populated
  Assert.AreEqual(MyRecord."No.", CardPage."No.".Value(), 'No. field should show record number');
  CardPage.Close();
end;
```

### 3. Codeunit Logic Tests

Verify business logic in codeunits:

```al
[Test]
procedure GivenValidData_WhenRunProcess_ThenResultIsCorrect()
var
  ProcessMgmt: Codeunit "[Prefix] Process Management";
  InputRecord: Record "[Prefix] Input Table";
  ResultRecord: Record "[Prefix] Result Table";
begin
  Initialize();

  // [GIVEN] Valid input data
  CreateTestInput(InputRecord);

  // [WHEN] Run processing
  ProcessMgmt.ProcessRecord(InputRecord);

  // [THEN] Result record exists with correct values
  ResultRecord.SetRange("Source Entry No.", InputRecord."Entry No.");
  Assert.RecordIsNotEmpty(ResultRecord);
end;
```

### 4. Error Validation Tests

Verify proper error handling:

```al
[Test]
procedure GivenInvalidData_WhenValidate_ThenErrorRaised()
var
  MyRecord: Record "[Prefix] My Record";
begin
  Initialize();

  // [GIVEN] Record with invalid data
  MyRecord.Init();

  // [WHEN/THEN] Validation raises error
  asserterror MyRecord.Validate("Required Field", '');
  Assert.ExpectedError('Required Field must have a value');
end;
```

### 5. Event Subscriber Tests

Verify event subscribers fire and produce expected results:

```al
[Test]
procedure GivenSubscriber_WhenEventFires_ThenHandlerExecutes()
var
  SourceRecord: Record "Source Table";
  ExtendedField: Record "[Prefix] Extended Table";
begin
  Initialize();

  // [GIVEN] Source record
  CreateSourceRecord(SourceRecord);

  // [WHEN] Action that triggers event
  SourceRecord.Modify(true);

  // [THEN] Subscriber should have updated extended data
  ExtendedField.SetRange("Source No.", SourceRecord."No.");
  Assert.RecordIsNotEmpty(ExtendedField);
end;
```

## Handler Method Patterns

### MessageHandler

```al
[MessageHandler]
procedure MessageHandler(Message: Text[1024])
begin
  // Option A: Verify specific message
  Assert.ExpectedMessage(LibraryVariableStorage.DequeueText(), Message);

  // Option B: Just suppress (do nothing)
end;
```

### ConfirmHandler

```al
[ConfirmHandler]
procedure ConfirmHandler(Question: Text[1024]; var Reply: Boolean)
begin
  Reply := LibraryVariableStorage.DequeueBoolean();
end;
```

### ModalPageHandler

```al
[ModalPageHandler]
procedure ModalPageHandler(var TestPage: TestPage "Target Page")
begin
  // Simulate user interaction
  TestPage."Field Name".SetValue(LibraryVariableStorage.DequeueText());
  TestPage.OK().Invoke();
end;
```

### PageHandler

```al
[PageHandler]
procedure PageHandler(var TestPage: TestPage "Target Page")
begin
  // Verify page content
  Assert.AreEqual(
    LibraryVariableStorage.DequeueText(),
    TestPage."Field Name".Value(),
    'Field should match expected value');
  TestPage.Close();
end;
```

## TestPage Methods Reference

| Method | Purpose |
|--------|---------|
| `OpenNew()` | Open page in insert mode |
| `OpenEdit()` | Open page in edit mode |
| `OpenView()` | Open page in read-only mode |
| `Close()` | Close the page |
| `GoToRecord(Record)` | Navigate to a specific record |
| `GoToKey(Values...)` | Navigate to record by primary key |
| `First()` / `Last()` / `Next()` / `Previous()` | Navigate records on list pages |
| `New()` | Insert new record on list page |
| `"FieldName".SetValue(Value)` | Set a field value |
| `"FieldName".Value()` | Read field display value |
| `"FieldName".AssistEdit()` | Trigger AssistEdit |
| `"FieldName".Lookup()` | Trigger field lookup |
| `"FieldName".DrillDown()` | Trigger drilldown |
| `"ActionName".Invoke()` | Run a page action |
| `OK().Invoke()` | Click OK button |
| `Cancel().Invoke()` | Click Cancel button |

## Test Runner Codeunit

### Purpose

Test runner codeunits (`Subtype = TestRunner`) manage execution of test codeunits and integrate with test management/reporting frameworks.

### Properties

| Property | Values | Description |
|----------|--------|-------------|
| `Subtype` | `TestRunner` | Marks codeunit as a test runner |
| `TestIsolation` | `Disabled`, `Codeunit`, `Function` | Controls transaction rollback scope |

- **Disabled**: No automatic rollback
- **Codeunit**: Roll back changes after each test codeunit completes
- **Function**: Roll back changes after each test method completes (most isolation)

### Triggers

| Trigger | Parameters | Purpose |
|---------|------------|---------|
| `OnRun` | None | Entry point — run test codeunits here |
| `OnBeforeTestRun` | `CodeunitId`, `CodeunitName`, `FunctionName`, `Permissions` → `Boolean` | Pre-test hook; return `false` to skip test |
| `OnAfterTestRun` | `CodeunitId`, `CodeunitName`, `FunctionName`, `Permissions`, `IsSuccess` | Post-test hook; log results |

**Important**: `OnBeforeTestRun` and `OnAfterTestRun` always run in their own transactions regardless of `TestIsolation` or `TransactionModel` settings.

When `FunctionName` is empty in `OnBeforeTestRun`/`OnAfterTestRun`, it refers to the `OnRun` trigger itself.

### Updating an Existing Test Runner

When adding a new test codeunit to an existing test runner:

1. Open the test runner codeunit
2. Add `Codeunit.Run(Codeunit::"[Prefix] New Test Codeunit");` in the `OnRun` trigger
3. Keep consistent order (group by feature area)

## Workflow

### Step 1: Analyze the Module

Before generating tests, identify what to test:

1. **Search the workspace** for all objects in the module (tables, pages, codeunits, reports)
2. **Read each object** to understand its structure and logic
3. **Identify testable elements**:
   - Page opens and navigation (card, list, API pages)
   - Setup page initialization
   - Codeunit procedures and business logic
   - Table validations and triggers
   - Event subscribers
   - Error handling paths

### Step 2: Determine Test Codeunit Structure

- One test codeunit per feature area or per source codeunit
- Name: `[Prefix] [Feature] Tests` (max 30 characters)
- ID: Next available in the test ID range

### Step 3: Create Test Codeunit

1. Create the file in the test project folder
2. Add `Subtype = Test` property
3. Declare standard test library variables (`Assert`, `LibraryVariableStorage`, etc.)
4. Add `Initialize()` procedure for shared setup
5. Create `[Test]` methods following Given/When/Then naming
6. Add handler methods for any UI interactions
7. Add helper procedures for test data creation

### Step 4: Create or Update Test Runner

**If no test runner exists:**
1. Create new codeunit with `Subtype = TestRunner`
2. Set `TestIsolation = Codeunit`
3. Add `Codeunit.Run()` calls for each test codeunit in `OnRun`
4. Implement `OnBeforeTestRun` returning `true`
5. Implement `OnAfterTestRun` (empty or with logging)

**If test runner exists:**
1. Open existing test runner
2. Add new `Codeunit.Run(Codeunit::"[Prefix] New Tests");` to `OnRun`

### Step 5: Build and Validate

1. Build the test project to verify compilation
2. Run tests via test runner or VS Code Test Explorer
3. Verify all tests pass

## Design Guidelines

- **One assertion per test** when practical — makes failures easier to diagnose
- **Independent tests** — each test should set up its own data, not depend on other tests
- **Use `Initialize()`** pattern for expensive one-time setup shared across tests
- **Commit() after Initialize()** — required so test transactions work correctly
- **Use `asserterror`** for negative tests — validates expected errors
- **Prefer `Library Assert`** methods over raw `Error()` comparisons
- **Use `LibraryVariableStorage`** to pass values between test methods and handlers
- **Enqueue before invoke** — always enqueue values in `LibraryVariableStorage` before triggering actions that invoke handlers
- **No hardcoded IDs** — use `LibraryRandom` for quantities and amounts
- **Use standard libraries** — prefer `Library - Sales`, `Library - ERM` for creating standard BC records
- **Clean descriptive names** — test names should describe the scenario without reading the code
- **Test both positive and negative paths** — verify success cases AND error handling

## File Naming Convention

- Test codeunit: `[Prefix][Feature]Tests.Codeunit.al`
- Test runner: `[Prefix]TestRunner.Codeunit.al`

Examples:
- `BCSStatAccTests.Codeunit.al` / `BCSTestRunner.Codeunit.al`
- `BCSSetupTests.Codeunit.al`

Place in: test project `src/[Feature]Tests/` or `test/[Feature]/` folder.

## Checklist

Before completing test codeunit generation:

- [ ] `Subtype = Test` set on test codeunit
- [ ] `[Test]` attribute on each test method
- [ ] Given/When/Then naming convention followed
- [ ] `Initialize()` procedure with `IsInitialized` guard and `Commit()`
- [ ] `Library Assert` used for all assertions
- [ ] Handler methods declared for any UI interactions triggered by tests
- [ ] `LibraryVariableStorage` used for passing data to handlers
- [ ] Values enqueued before actions that invoke handlers
- [ ] Test data created within each test (independent tests)
- [ ] Both positive and error paths tested
- [ ] Test runner codeunit created or updated with new test codeunit
- [ ] `TestIsolation = Codeunit` set on test runner
- [ ] `OnBeforeTestRun` returns `true`
- [ ] File follows naming convention

## External References

- [Test Codeunits and Test Methods](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-test-codeunits-and-test-methods) — Microsoft Docs
- [Test Runner Codeunits](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-testrunner-codeunits) — Microsoft Docs
- [Testing the Application](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-testing-application) — Testing overview
- [Create Handler Methods](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-creating-handler-methods) — Handler patterns
- [TestPage Data Type](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/methods-auto/testpage/testpage-data-type) — TestPage methods
- [Library Assert](https://github.com/microsoft/BCApps/tree/main/src/Tools/Test%20Framework/Test%20Libraries) — System Application test libraries
