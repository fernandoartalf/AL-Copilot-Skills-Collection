# Test Codeunit Examples

## Example 1: Setup and Navigation Test Codeunit

Tests setup table initialization, setup page navigation, and list/card page opening for a module with a setup table and statistical accounts.

```al
codeunit 60900 "BCS Stat. Acc. Tests"
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

        IsInitialized := true;
        Commit();
    end;

    // ═══════════════════════════════════════════
    // Setup Tests
    // ═══════════════════════════════════════════

    [Test]
    procedure GivenNoSetup_WhenOpenSetupPage_ThenRecordCreated()
    var
        BCSStatAccSetup: Record "BCS Statistical Account Setup";
        SetupPage: TestPage "BCS Statistical Account Setup";
    begin
        // [SCENARIO] Opening setup page auto-creates setup record
        Initialize();

        // [GIVEN] No setup record exists
        BCSStatAccSetup.DeleteAll();

        // [WHEN] Setup page is opened
        SetupPage.OpenEdit();

        // [THEN] Setup record is created automatically
        Assert.IsTrue(BCSStatAccSetup.Get(), 'Setup record should be auto-created on page open');
        SetupPage.Close();
    end;

    [Test]
    procedure GivenSetupExists_WhenOpenSetupPage_ThenFieldsVisible()
    var
        BCSStatAccSetup: Record "BCS Statistical Account Setup";
        SetupPage: TestPage "BCS Statistical Account Setup";
    begin
        // [SCENARIO] Setup page displays field values correctly
        Initialize();

        // [GIVEN] Setup record with values
        if not BCSStatAccSetup.Get() then begin
            BCSStatAccSetup.Init();
            BCSStatAccSetup.Insert();
        end;

        // [WHEN] Setup page is opened
        SetupPage.OpenEdit();

        // [THEN] Page opens without error and fields are accessible
        SetupPage.Close();
    end;

    // ═══════════════════════════════════════════
    // Page Navigation Tests
    // ═══════════════════════════════════════════

    [Test]
    procedure GivenModule_WhenOpenStatAccList_ThenPageOpens()
    var
        ListPage: TestPage "Statistical Account List";
    begin
        // [SCENARIO] Statistical Account List page opens
        Initialize();

        // [WHEN] List page is opened
        ListPage.OpenView();

        // [THEN] Page opens without error
        ListPage.Close();
    end;

    [Test]
    procedure GivenModule_WhenOpenStatAccCard_ThenPageOpens()
    var
        CardPage: TestPage "Statistical Account Card";
    begin
        // [SCENARIO] Statistical Account Card page opens
        Initialize();

        // [WHEN] Card page is opened
        CardPage.OpenView();

        // [THEN] Page opens without error
        CardPage.Close();
    end;

    // ═══════════════════════════════════════════
    // Install Codeunit Tests
    // ═══════════════════════════════════════════

    [Test]
    procedure GivenFreshInstall_WhenCheckSetup_ThenSetupExists()
    var
        BCSStatAccSetup: Record "BCS Statistical Account Setup";
    begin
        // [SCENARIO] After install, setup record should exist
        Initialize();

        // [GIVEN/WHEN] Extension is installed (simulated by checking)

        // [THEN] Setup record exists
        Assert.IsTrue(BCSStatAccSetup.Get(), 'Setup record should exist after install');
    end;
}
```

**Key points:**
- `Subtype = Test` marks the codeunit as a test codeunit
- `Initialize()` with `IsInitialized` guard prevents redundant setup
- `Commit()` after initialization ensures test transactions work correctly
- Each test follows Given/When/Then structure with `[SCENARIO]` comments
- `TestPage` type used for page navigation tests
- Tests are independent — each sets up its own data

---

## Example 2: Comprehensive Module Test with Handlers

Tests a module with pages, codeunits, message handlers, and confirm dialogs.

```al
codeunit 60900 "BCS Order Mgmt Tests"
{
    Subtype = Test;

    var
        Assert: Codeunit "Library Assert";
        LibraryVariableStorage: Codeunit "Library Variable Storage";
        LibrarySales: Codeunit "Library - Sales";
        LibraryRandom: Codeunit "Library - Random";
        IsInitialized: Boolean;

    local procedure Initialize()
    begin
        LibraryVariableStorage.Clear();
        if IsInitialized then
            exit;

        IsInitialized := true;
        Commit();
    end;

    // ═══════════════════════════════════════════
    // Codeunit Logic Tests
    // ═══════════════════════════════════════════

    [Test]
    procedure GivenValidCustomer_WhenCalculateDiscount_ThenDiscountApplied()
    var
        Customer: Record Customer;
        BCSDiscountMgmt: Codeunit "BCS Discount Management";
        DiscountPct: Decimal;
    begin
        // [SCENARIO] Discount calculation returns correct percentage
        Initialize();

        // [GIVEN] Customer with high sales volume
        LibrarySales.CreateCustomer(Customer);

        // [WHEN] Discount is calculated
        DiscountPct := BCSDiscountMgmt.CalculateDiscount(Customer."No.");

        // [THEN] Discount percentage is within valid range
        Assert.IsTrue(DiscountPct >= 0, 'Discount should be non-negative');
        Assert.IsTrue(DiscountPct <= 100, 'Discount should not exceed 100%');
    end;

    [Test]
    procedure GivenBlankCustomer_WhenCalculateDiscount_ThenZeroReturned()
    var
        BCSDiscountMgmt: Codeunit "BCS Discount Management";
        DiscountPct: Decimal;
    begin
        // [SCENARIO] Blank customer returns zero discount
        Initialize();

        // [WHEN] Discount calculated for blank customer
        DiscountPct := BCSDiscountMgmt.CalculateDiscount('');

        // [THEN] Zero discount returned
        Assert.AreEqual(0, DiscountPct, 'Blank customer should get zero discount');
    end;

    // ═══════════════════════════════════════════
    // Error Validation Tests
    // ═══════════════════════════════════════════

    [Test]
    procedure GivenInvalidInput_WhenProcess_ThenErrorRaised()
    var
        BCSProcessMgmt: Codeunit "BCS Process Management";
    begin
        // [SCENARIO] Invalid input raises expected error
        Initialize();

        // [WHEN/THEN] Processing invalid input raises error
        asserterror BCSProcessMgmt.ProcessOrder('');
        Assert.ExpectedError('Order No. must have a value');
    end;

    // ═══════════════════════════════════════════
    // Handler-Based Tests
    // ═══════════════════════════════════════════

    [Test]
    [HandlerFunctions('ConfirmYesHandler')]
    procedure GivenOrder_WhenConfirmPost_ThenOrderPosted()
    var
        SalesHeader: Record "Sales Header";
        BCSOrderMgmt: Codeunit "BCS Order Management";
    begin
        // [SCENARIO] Confirming post processes the order
        Initialize();

        // [GIVEN] Sales order
        LibrarySales.CreateSalesHeader(
            SalesHeader,
            SalesHeader."Document Type"::Order,
            '');

        // [WHEN] Post with confirmation (handler returns true)
        BCSOrderMgmt.PostWithConfirmation(SalesHeader);

        // [THEN] Order is processed (verified by handler not erroring)
    end;

    [Test]
    [HandlerFunctions('MessageHandler')]
    procedure GivenSetup_WhenRunProcess_ThenSuccessMessage()
    var
        BCSProcessMgmt: Codeunit "BCS Process Management";
    begin
        // [SCENARIO] Successful processing shows message
        Initialize();

        // [GIVEN] Expected message
        LibraryVariableStorage.Enqueue('Processing completed successfully.');

        // [WHEN] Run process
        BCSProcessMgmt.RunBatchProcess();

        // [THEN] Message is shown (validated in handler)
    end;

    [Test]
    [HandlerFunctions('ModalPageHandler')]
    procedure GivenRecord_WhenLookup_ThenPageOpensWithData()
    var
        CardPage: TestPage "BCS Custom Card";
    begin
        // [SCENARIO] Lookup opens modal page with correct data
        Initialize();

        // [GIVEN] Expected value for modal
        LibraryVariableStorage.Enqueue('EXPECTED-VALUE');

        // [WHEN] Open card and trigger lookup
        CardPage.OpenEdit();
        CardPage."Lookup Field".Lookup();
        CardPage.Close();

        // [THEN] Modal page handler validates the data
    end;

    // ═══════════════════════════════════════════
    // Handler Methods
    // ═══════════════════════════════════════════

    [ConfirmHandler]
    procedure ConfirmYesHandler(Question: Text[1024]; var Reply: Boolean)
    begin
        Reply := true;
    end;

    [MessageHandler]
    procedure MessageHandler(Message: Text[1024])
    begin
        Assert.ExpectedMessage(LibraryVariableStorage.DequeueText(), Message);
    end;

    [ModalPageHandler]
    procedure ModalPageHandler(var LookupPage: TestPage "BCS Lookup Page")
    begin
        Assert.AreEqual(
            LibraryVariableStorage.DequeueText(),
            LookupPage."Code".Value(),
            'Lookup page should show expected value');
        LookupPage.OK().Invoke();
    end;

    // ═══════════════════════════════════════════
    // Helper Procedures
    // ═══════════════════════════════════════════

    local procedure CreateTestCustomer(var Customer: Record Customer)
    begin
        LibrarySales.CreateCustomer(Customer);
        Customer."Credit Limit (LCY)" := LibraryRandom.RandDec(10000, 2);
        Customer.Modify();
    end;
}
```

**Key points:**
- `[HandlerFunctions('HandlerName')]` attribute links test method to its handlers
- `LibraryVariableStorage.Enqueue()` passes expected values to handlers
- `LibraryVariableStorage.DequeueText()` retrieves values inside handlers
- Always enqueue **before** the action that triggers the handler
- `asserterror` keyword validates expected error conditions
- `Assert.ExpectedError()` checks the error message text
- `Assert.ExpectedMessage()` for partial message text matching
- Standard library codeunits (`Library - Sales`, `Library - Random`) create test data

---

## Example 3: Test Runner Codeunit — Basic Pattern

Simple test runner that executes test codeunits sequentially.

```al
codeunit 60910 "BCS Test Runner"
{
    Subtype = TestRunner;
    TestIsolation = Codeunit;

    trigger OnRun()
    begin
        // Feature: Statistical Accounts
        Codeunit.Run(Codeunit::"BCS Stat. Acc. Tests");

        // Feature: Order Management
        Codeunit.Run(Codeunit::"BCS Order Mgmt Tests");
    end;

    trigger OnBeforeTestRun(
        CodeunitId: Integer;
        CodeunitName: Text;
        FunctionName: Text;
        Permissions: TestPermissions): Boolean
    begin
        // Return true to execute the test, false to skip
        exit(true);
    end;

    trigger OnAfterTestRun(
        CodeunitId: Integer;
        CodeunitName: Text;
        FunctionName: Text;
        Permissions: TestPermissions;
        IsSuccess: Boolean)
    begin
        // Post-test processing (logging, cleanup)
        // Note: implementing this trigger suppresses automatic result messages
    end;
}
```

**Key points:**
- `Subtype = TestRunner` marks the codeunit as a test runner
- `TestIsolation = Codeunit` rolls back database changes after each test codeunit
- `OnRun` trigger lists all test codeunits to execute
- `OnBeforeTestRun` returns `true` to allow test execution, `false` to skip
- `OnAfterTestRun` suppresses automatic result display when implemented
- Group codeunit runs by feature area with comments

---

## Example 4: Test Runner with Logging

Test runner that logs results for each test method to Application Insights telemetry.

```al
codeunit 60910 "BCS Test Runner"
{
    Subtype = TestRunner;
    TestIsolation = Codeunit;

    var
        StartTime: DateTime;
        TotalTests: Integer;
        PassedTests: Integer;
        FailedTests: Integer;

    trigger OnRun()
    begin
        TotalTests := 0;
        PassedTests := 0;
        FailedTests := 0;

        Codeunit.Run(Codeunit::"BCS Stat. Acc. Tests");
        Codeunit.Run(Codeunit::"BCS Setup Tests");
    end;

    trigger OnBeforeTestRun(
        CodeunitId: Integer;
        CodeunitName: Text;
        FunctionName: Text;
        Permissions: TestPermissions): Boolean
    begin
        if FunctionName = '' then
            exit(true);

        StartTime := CurrentDateTime();
        TotalTests += 1;
        exit(true);
    end;

    trigger OnAfterTestRun(
        CodeunitId: Integer;
        CodeunitName: Text;
        FunctionName: Text;
        Permissions: TestPermissions;
        IsSuccess: Boolean)
    var
        Duration: Duration;
        Dimensions: Dictionary of [Text, Text];
    begin
        if FunctionName = '' then
            exit;

        Duration := CurrentDateTime() - StartTime;

        if IsSuccess then
            PassedTests += 1
        else
            FailedTests += 1;

        Dimensions.Add('CodeunitId', Format(CodeunitId));
        Dimensions.Add('CodeunitName', CodeunitName);
        Dimensions.Add('FunctionName', FunctionName);
        Dimensions.Add('IsSuccess', Format(IsSuccess));
        Dimensions.Add('Duration', Format(Duration));
        Dimensions.Add('TotalTests', Format(TotalTests));
        Dimensions.Add('PassedTests', Format(PassedTests));
        Dimensions.Add('FailedTests', Format(FailedTests));

        Session.LogMessage(
            'BCS-TEST-0001',
            StrSubstNo('Test %1.%2: %3 (%4ms)',
                CodeunitName,
                FunctionName,
                SelectStr(1 + Abs(IsSuccess.AsInteger()), 'FAIL,PASS'),
                Duration),
            Verbosity::Normal,
            DataClassification::SystemMetadata,
            TelemetryScope::ExtensionPublisher,
            Dimensions
        );
    end;
}
```

**Key points:**
- `FunctionName = ''` check skips the `OnRun` trigger itself
- `StartTime` captured in `OnBeforeTestRun` for duration calculation
- Telemetry dimensions include all useful test metadata
- Running totals track overall test suite progress
- `Session.LogMessage` sends results to Application Insights

---

## Example 5: Test Runner with Table-Based Test Suite

Test runner that reads test codeunit IDs from a configuration table, allowing dynamic test suite management.

```al
codeunit 60910 "BCS Test Runner"
{
    Subtype = TestRunner;
    TestIsolation = Codeunit;

    trigger OnRun()
    var
        EnabledTestCodeunit: Record "CAL Test Enabled Codeunit";
        AllObj: Record AllObjWithCaption;
    begin
        if EnabledTestCodeunit.FindSet() then
            repeat
                AllObj.SetRange("Object Type", AllObj."Object Type"::Codeunit);
                AllObj.SetRange("Object ID", EnabledTestCodeunit."Test Codeunit ID");
                if AllObj.FindFirst() then
                    Codeunit.Run(EnabledTestCodeunit."Test Codeunit ID");
            until EnabledTestCodeunit.Next() = 0;
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

**Key points:**
- `CAL Test Enabled Codeunit` table stores which test codeunits to run
- `AllObjWithCaption` validates the codeunit exists before running
- Allows adding/removing tests without modifying code
- Useful for large test suites with selective execution

---

## Example 6: Wizard Page Test with Multiple Handlers

Tests an assisted setup wizard page with step navigation, confirm dialogs, and messages.

```al
codeunit 60900 "BCS Setup Wizard Tests"
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

        IsInitialized := true;
        Commit();
    end;

    [Test]
    procedure GivenWizard_WhenOpenPage_ThenWelcomeStepShown()
    var
        WizardPage: TestPage "BCS Setup Wizard";
    begin
        // [SCENARIO] Wizard opens to welcome step
        Initialize();

        // [WHEN] Wizard page opens
        WizardPage.OpenEdit();

        // [THEN] Welcome step is shown (Back disabled, Next enabled)
        Assert.IsFalse(WizardPage.ActionBack.Enabled(), 'Back should be disabled on first step');
        Assert.IsTrue(WizardPage.ActionNext.Enabled(), 'Next should be enabled on first step');
        WizardPage.Close();
    end;

    [Test]
    procedure GivenWelcomeStep_WhenClickNext_ThenConfigStepShown()
    var
        WizardPage: TestPage "BCS Setup Wizard";
    begin
        // [SCENARIO] Clicking Next advances to configuration step
        Initialize();

        // [GIVEN] Wizard at welcome step
        WizardPage.OpenEdit();

        // [WHEN] Click Next
        WizardPage.ActionNext.Invoke();

        // [THEN] Configuration step is shown (Back enabled)
        Assert.IsTrue(WizardPage.ActionBack.Enabled(), 'Back should be enabled on second step');
        WizardPage.Close();
    end;

    [Test]
    [HandlerFunctions('ConfirmFinishHandler')]
    procedure GivenLastStep_WhenClickFinish_ThenSetupCompleted()
    var
        BCSStatAccSetup: Record "BCS Statistical Account Setup";
        WizardPage: TestPage "BCS Setup Wizard";
    begin
        // [SCENARIO] Finishing wizard saves configuration
        Initialize();

        // [GIVEN] Wizard navigated to last step
        WizardPage.OpenEdit();
        WizardPage.ActionNext.Invoke(); // Step 2
        WizardPage.ActionNext.Invoke(); // Step 3 (last)

        // [WHEN] Click Finish
        WizardPage.ActionFinish.Invoke();

        // [THEN] Setup record is configured
        Assert.IsTrue(BCSStatAccSetup.Get(), 'Setup should exist after wizard completion');
    end;

    [Test]
    [HandlerFunctions('ConfirmNoHandler')]
    procedure GivenIncompleteWizard_WhenClose_ThenConfirmAsked()
    var
        WizardPage: TestPage "BCS Setup Wizard";
    begin
        // [SCENARIO] Closing unfinished wizard asks for confirmation
        Initialize();

        // [GIVEN] Wizard at step 2 (incomplete)
        WizardPage.OpenEdit();
        WizardPage.ActionNext.Invoke();

        // [WHEN] Close page (triggers OnQueryClosePage)
        WizardPage.Close();

        // [THEN] Confirm handler was called (validated by handler)
    end;

    // ═══════════════════════════════════════════
    // Handlers
    // ═══════════════════════════════════════════

    [ConfirmHandler]
    procedure ConfirmFinishHandler(Question: Text[1024]; var Reply: Boolean)
    begin
        Reply := true;
    end;

    [ConfirmHandler]
    procedure ConfirmNoHandler(Question: Text[1024]; var Reply: Boolean)
    begin
        Reply := false;
    end;
}
```

**Key points:**
- Wizard tests navigate through steps using `ActionNext.Invoke()`
- `Enabled()` checks verify correct button states per step
- `[HandlerFunctions]` attribute declares which handlers the test uses
- Multiple `[ConfirmHandler]` procedures can exist — linked by `[HandlerFunctions]` name
- `OnQueryClosePage` triggers are tested by calling `.Close()` on unfinished wizards

---

## Example 7: API Page Test

Tests API page endpoints for correct data exposure and field mapping.

```al
codeunit 60900 "BCS API Tests"
{
    Subtype = Test;

    var
        Assert: Codeunit "Library Assert";
        IsInitialized: Boolean;

    local procedure Initialize()
    begin
        if IsInitialized then
            exit;

        IsInitialized := true;
        Commit();
    end;

    [Test]
    procedure GivenRecord_WhenOpenAPIPage_ThenFieldsMapped()
    var
        StatAccount: Record "Statistical Account";
        APIPage: TestPage "BCS Statistic Account API";
    begin
        // [SCENARIO] API page exposes record fields correctly
        Initialize();

        // [GIVEN] Statistical account exists
        CreateTestStatAccount(StatAccount);

        // [WHEN] API page opened and navigated to record
        APIPage.OpenView();
        APIPage.GoToRecord(StatAccount);

        // [THEN] Fields are correctly mapped
        Assert.AreEqual(
            StatAccount."No.",
            APIPage.number.Value(),
            'API number field should match No.');
        APIPage.Close();
    end;

    [Test]
    procedure GivenEmptyTable_WhenOpenAPIPage_ThenNoRecords()
    var
        APIPage: TestPage "BCS Statistic Account API";
    begin
        // [SCENARIO] API page handles empty dataset
        Initialize();

        // [WHEN] API page opened with no data
        APIPage.OpenView();

        // [THEN] Page opens without error
        APIPage.Close();
    end;

    local procedure CreateTestStatAccount(var StatAccount: Record "Statistical Account")
    begin
        StatAccount.Init();
        StatAccount."No." := 'TEST-001';
        StatAccount.Name := 'Test Statistical Account';
        if not StatAccount.Insert() then
            StatAccount.Modify();
    end;
}
```

**Key points:**
- API pages are tested like any other page using `TestPage`
- Field names on API pages use the `EntityName` (camelCase) not the AL field name
- `GoToRecord` navigates to a specific record on the API page
- Test both populated and empty data scenarios

---

## Example 8: Event Subscriber Test

Tests that event subscribers fire correctly and produce expected side effects.

```al
codeunit 60900 "BCS Event Tests"
{
    Subtype = Test;

    var
        Assert: Codeunit "Library Assert";
        LibrarySales: Codeunit "Library - Sales";
        IsInitialized: Boolean;

    local procedure Initialize()
    begin
        if IsInitialized then
            exit;

        IsInitialized := true;
        Commit();
    end;

    [Test]
    procedure GivenSubscriber_WhenCustomerModified_ThenExtFieldUpdated()
    var
        Customer: Record Customer;
    begin
        // [SCENARIO] Event subscriber updates extended field on Customer modify
        Initialize();

        // [GIVEN] Customer record
        LibrarySales.CreateCustomer(Customer);

        // [WHEN] Customer is modified (triggers OnAfterModify subscriber)
        Customer.Name := 'Updated Name';
        Customer.Modify(true);

        // [THEN] Extended field updated by subscriber
        Customer.Get(Customer."No.");
        Assert.AreNotEqual(
            0DT,
            Customer."BCS Last Modified DateTime",
            'Subscriber should stamp last modified datetime');
    end;

    [Test]
    procedure GivenSubscriber_WhenRecordDeleted_ThenCleanupRuns()
    var
        Customer: Record Customer;
        BCSCustomerExt: Record "BCS Customer Extension";
    begin
        // [SCENARIO] Delete subscriber cleans up related records
        Initialize();

        // [GIVEN] Customer with extension record
        LibrarySales.CreateCustomer(Customer);
        CreateExtensionRecord(BCSCustomerExt, Customer."No.");

        // [WHEN] Customer deleted (triggers OnBeforeDelete subscriber)
        Customer.Delete(true);

        // [THEN] Extension record also deleted
        BCSCustomerExt.SetRange("Customer No.", Customer."No.");
        Assert.RecordIsEmpty(BCSCustomerExt);
    end;

    local procedure CreateExtensionRecord(
        var BCSCustomerExt: Record "BCS Customer Extension";
        CustomerNo: Code[20])
    begin
        BCSCustomerExt.Init();
        BCSCustomerExt."Customer No." := CustomerNo;
        BCSCustomerExt.Insert();
    end;
}
```

**Key points:**
- Test event subscribers by performing the action that triggers the event
- Verify side effects (new records, updated fields) after the triggering action
- Use `Modify(true)` to ensure triggers and subscribers fire
- Test both creation/modification and deletion cleanup scenarios

---

## Example 9: Updating an Existing Test Runner

When a new test codeunit is created, update the existing test runner by adding a `Codeunit.Run()` line.

**Before (existing test runner):**

```al
codeunit 60910 "BCS Test Runner"
{
    Subtype = TestRunner;
    TestIsolation = Codeunit;

    trigger OnRun()
    begin
        // Feature: Statistical Accounts
        Codeunit.Run(Codeunit::"BCS Stat. Acc. Tests");
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

**After (updated with new test codeunit):**

```al
codeunit 60910 "BCS Test Runner"
{
    Subtype = TestRunner;
    TestIsolation = Codeunit;

    trigger OnRun()
    begin
        // Feature: Statistical Accounts
        Codeunit.Run(Codeunit::"BCS Stat. Acc. Tests");

        // Feature: Setup Wizard
        Codeunit.Run(Codeunit::"BCS Setup Wizard Tests");

        // Feature: API
        Codeunit.Run(Codeunit::"BCS API Tests");
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

**Key points:**
- Add new `Codeunit.Run()` lines in the `OnRun` trigger
- Group by feature area with comments
- Keep consistent ordering (alphabetical or by dependency)
- No changes needed to `OnBeforeTestRun`/`OnAfterTestRun` when adding tests

---

## Example 10: TestPermissions and Permission Set Testing

Tests that verify extension objects work correctly under restricted permissions.

```al
codeunit 60900 "BCS Permission Tests"
{
    Subtype = Test;
    TestPermissions = Restrictive;

    var
        Assert: Codeunit "Library Assert";
        IsInitialized: Boolean;

    local procedure Initialize()
    begin
        if IsInitialized then
            exit;

        IsInitialized := true;
        Commit();
    end;

    [Test]
    procedure GivenRestrictivePerms_WhenReadSetup_ThenAccessGranted()
    var
        BCSStatAccSetup: Record "BCS Statistical Account Setup";
    begin
        // [SCENARIO] Permission set grants read access to setup
        Initialize();

        // [GIVEN] Restrictive permissions with BCS permission set

        // [WHEN] Read setup record
        // [THEN] No permission error
        if BCSStatAccSetup.Get() then;
    end;

    [Test]
    procedure GivenRestrictivePerms_WhenOpenSetupPage_ThenAccessGranted()
    var
        SetupPage: TestPage "BCS Statistical Account Setup";
    begin
        // [SCENARIO] Permission set grants page access
        Initialize();

        // [WHEN] Open setup page under restrictive permissions
        SetupPage.OpenView();

        // [THEN] Page opens without permission error
        SetupPage.Close();
    end;
}
```

**Key points:**
- `TestPermissions = Restrictive` limits permissions to what's explicitly granted
- Tests verify extension permission sets grant necessary access
- Catches missing permission set entries early
- Alternative values: `Disabled` (default), `NonRestrictive`, `Restrictive`
