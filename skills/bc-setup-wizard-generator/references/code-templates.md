# BC Setup Wizard - Code Templates

Complete AL code templates for implementing assisted setup wizards in Business Central.

## Table of Contents

1. [Wizard Page Structure](#wizard-page-structure)
2. [Banner Groups](#banner-groups)
3. [Step Groups](#step-groups)
4. [Navigation Actions](#navigation-actions)
5. [Page Triggers](#page-triggers)
6. [Navigation Procedures](#navigation-procedures)
7. [Data Management Procedures](#data-management-procedures)
8. [Banner Loading Procedure](#banner-loading-procedure)
9. [Variable Declarations](#variable-declarations)
10. [Registration Codeunit](#registration-codeunit)
11. [Complete Example](#complete-example)

---

## Wizard Page Structure

Basic wizard page structure with NavigatePage type:

```al
page [ID] "[Prefix] [Entity] Setup Wizard"
{
  ApplicationArea = All;
  Caption = '✨[Entity] Setup Wizard✨';
  PageType = NavigatePage;
  SourceTable = "[Prefix] [Entity] Setup";
  SourceTableTemporary = true;  // Critical - enables unsaved workflow

  layout
  {
    area(Content)
    {
      // Banner groups go here
      // Step groups go here
    }
  }
  
  actions
  {
    area(Processing)
    {
      // Navigation actions go here
    }
  }
  
  trigger OnOpenPage()
  begin
    InitRecord();
    EnableControls();
    LoadSetupBanner();
  end;
  
  trigger OnQueryClosePage(CloseAction: Action): Boolean
  var
    ExitDeleteTxt: Label 'The changes will be lost☠️. Do you want to exit?🙁💔';
  begin
    if FinishedProcess then begin
      CommitRecord();
      GuidedExperience.CompleteAssistedSetup(ObjectType::Page, Page::"[Prefix] [Entity] Setup Wizard");
    end else
      if GuiAllowed and not (Confirm(ExitDeleteTxt)) then
        Error('');
  end;
  
  // Procedures go here
  // Variables go here
}
```

---

## Banner Groups

Two banner groups for visual feedback - WIP during configuration, Finished on review step:

```al
Group(SetupWIPBanner)
{
  Caption = '';
  Editable = false;
  Visible = (not FinishActionEnabled) and BannersVisible;
  field(MediaRepositoryWIPField; MediaResourcesWIP."Media Reference")
  {
    ApplicationArea = All;
    Editable = false;
    ShowCaption = false;
  }
}

group(SetupFinishedBanner)
{
  Caption = '';
  Editable = false;
  Visible = FinishActionEnabled and BannersVisible;
  field(MediaRepositoryFinishedField; MediaResourcesFinished."Media Reference")
  {
    ApplicationArea = All;
    Editable = false;
    ShowCaption = false;
  }
}
```

**Key Points**:
- WIP visible when NOT on finish step (`not FinishActionEnabled`)
- Finished visible when on finish step (`FinishActionEnabled`)
- Both require `BannersVisible` (set by LoadSetupBanner)

---

## Step Groups

### Welcome Step (Step 1)

```al
group(Step10)
{
  Visible = Step10Visible;
  group(S11)
  {
    Caption = '🛠️Welcome to the [Entity] Setup Wizard🛠️';
    InstructionalText = 'This wizard will guide you through the setup process for [Entity] 🚀. 👉 Please follow the steps to configure the necessary settings.';
  }
  group(S12)
  {
    ShowCaption = false;
    InstructionalText = 'Choose Next when you are ready to start setting the module 👇 (It will be quick and painless😉.).';
  }
}
```

### Configuration Step (Step 2)

```al
group(Step20)
{
  Visible = Step20Visible;
  group(S21)
  {
    Caption = 'Attachments Settings 📎(Step 1/3)';  // Show progress
    field("Enable Attachments"; Rec."Enable Attachments")
    {
      ApplicationArea = All;
      Caption = 'Enable Attachments on [Entity]';
      ToolTip = 'Specifies whether attachments are enabled on [Entity].';
    }
    field("Enable Links"; Rec."Enable Links")
    {
      ApplicationArea = All;
      Caption = 'Enable Links on [Entity]';
      ToolTip = 'Specifies whether links are enabled on [Entity].';
    }
    field("Enable Notes"; Rec."Enable Notes")
    {
      ApplicationArea = All;
      Caption = 'Enable Notes on [Entity]';
      ToolTip = 'Specifies whether notes are enabled on [Entity].';
    }
  }
}
```

### Additional Configuration Step (Step 3)

```al
group(Step30)
{
  Visible = Step30Visible;
  group(S31)
  {
    Caption = 'Number Series Setup 🆔 (Step 2/3)';
    field("Statistical Account Nos."; Rec."Statistical Account Nos.")
    {
      ApplicationArea = All;
      Caption = '[Entity] Nos.';
      ToolTip = 'Specifies the number series used for [Entity].';
    }
    field("Default API Journal Temp. Name"; Rec."Default API Journal Temp. Name")
    {
      ApplicationArea = All;
      Caption = 'Default API Journal Template Name';
      ToolTip = 'Specifies the default API Journal Template Name for [Entity].';
    }
    // Add more fields as needed
  }
}
```

### Review & Finish Step (Final Step)

```al
group(Step40)
{
  Visible = Step40Visible;
  
  group(S41)
  {
    Caption = 'Review & Finish 🧐 (Step 3/3)';
    InstructionalText = '🎉Congratulations!🎉 You have survived the setup for [Entity]! 😎 Please review your settings below and click Finish to save your configuration. If you need to make any changes, use the Back👈 button to navigate to the previous steps.';
  }
  
  group(S42)
  {
    Caption = 'Attachments Settings 📎';
    Editable = false;  // Read-only review
    field("Enable Attachments Review"; Rec."Enable Attachments")
    {
      ApplicationArea = All;
      Caption = 'Enable Attachments on [Entity]';
      ToolTip = 'Specifies whether attachments are enabled on [Entity].';
    }
    field("Enable Links Review"; Rec."Enable Links")
    {
      ApplicationArea = All;
      Caption = 'Enable Links on [Entity]';
      ToolTip = 'Specifies whether links are enabled on [Entity].';
    }
    field("Enable Notes Review"; Rec."Enable Notes")
    {
      ApplicationArea = All;
      Caption = 'Enable Notes on [Entity]';
      ToolTip = 'Specifies whether notes are enabled on [Entity].';
    }
  }
  
  group(S43)
  {
    Caption = 'Number Series Setup 🆔';
    Editable = false;
    field("Statistical Account Nos Review"; Rec."Statistical Account Nos.")
    {
      ApplicationArea = All;
      Caption = '[Entity] Nos.';
      ToolTip = 'Specifies the number series used for [Entity].';
    }
  }
}
```

**Critical**: 
- Review groups must have `Editable = false`
- Field names must be unique (append "Review" suffix)
- Caption should show completion (Step X/X)

---

## Navigation Actions

Three footer actions for wizard navigation:

```al
actions
{
  area(Processing)
  {
    action(ActionBack)
    {
      ApplicationArea = all;
      Caption = 'Back👈';
      Enabled = BackActionEnabled;
      Image = PreviousRecord;
      InFooterBar = true;
      trigger OnAction()
      begin
        NextStep(true);
      end;
    }
    
    action(ActionNext)
    {
      ApplicationArea = all;
      Caption = 'Next👉';
      Enabled = NextActionEnabled;
      Image = NextRecord;
      InFooterBar = true;
      trigger OnAction()
      begin
        NextStep(false);
      end;
    }
    
    action(ActionFinish)
    {
      ApplicationArea = all;
      Caption = '✨Finish✨';
      Enabled = FinishActionEnabled;
      Image = Approve;
      InFooterBar = true;
      trigger OnAction()
      begin
        FinishAction();
      end;
    }
  }
}
```

**Key Points**:
- `InFooterBar = true` positions actions at bottom
- `Enabled` properties control availability per step
- Back passes `true` (backwards), Next passes `false` (forward)

---

## Page Triggers

### OnOpenPage Trigger

Initializes wizard when page opens:

```al
trigger OnOpenPage()
begin
  InitRecord();           // Load setup data into temporary record
  EnableControls();       // Show first step
  LoadSetupBanner();      // Load banner images
end;
```

### OnQueryClosePage Trigger

Handles page closure - commits if finished, confirms if abandoned:

```al
trigger OnQueryClosePage(CloseAction: Action): Boolean
var
  ExitDeleteTxt: Label 'The changes will be lost☠️. Do you want to exit?🙁💔';
begin
  if FinishedProcess then begin
    CommitRecord();
    GuidedExperience.CompleteAssistedSetup(ObjectType::Page, Page::"[Prefix] [Entity] Setup Wizard");
  end else
    if GuiAllowed and not (Confirm(ExitDeleteTxt)) then
      Error('');
end;
```

**Flow**:
1. If `FinishedProcess = true`: Save changes, mark wizard complete
2. Else: Ask user to confirm abandon (changes lost)
3. If user declines: `Error('')` prevents close

---

## Navigation Procedures

### ResetControls Procedure

Resets all step visibility and action states to default:

```al
local procedure ResetControls()
begin
  FinishActionEnabled := false;
  BackActionEnabled := true;
  NextActionEnabled := true;
  
  Step10Visible := false;
  Step20Visible := false;
  Step30Visible := false;
  Step40Visible := false;
end;
```

### NextStep Procedure

Increments or decrements step, then updates visibility:

```al
local procedure NextStep(Backwards: Boolean)
begin
  if Backwards then
    Step := Step - 1
  else
    Step := Step + 1;
  
  EnableControls();
end;
```

### EnableControls Procedure

Routes current step to corresponding visibility procedure:

```al
local procedure EnableControls()
begin
  ResetControls();
  
  case Step of
    Step::Step10:
      SetControlsStep10();
    Step::Step20:
      SetControlsStep20();
    Step::Step30:
      SetControlsStep30();
    Step::Step40:
      SetControlsStep40();
  end;
end;
```

**Critical**: Case values must match Step option enum values exactly.

### SetControlsStepXX Procedures

Set visibility and action states for each step:

```al
local procedure SetControlsStep10()
begin
  Step10Visible := true;
  FinishActionEnabled := false;
  BackActionEnabled := false;  // No back on first step
end;

local procedure SetControlsStep20()
begin
  Step20Visible := true;
  // Defaults from ResetControls: Back enabled, Next enabled, Finish disabled
end;

local procedure SetControlsStep30()
begin
  Step30Visible := true;
end;

local procedure SetControlsStep40()
begin
  Step40Visible := true;
  NextActionEnabled := false;    // No next on last step
  FinishActionEnabled := true;   // Enable finish
end;
```

**Pattern**:
- First step: Disable Back
- Middle steps: Use defaults (Back + Next enabled)
- Last step: Disable Next, enable Finish

---

## Data Management Procedures

### InitRecord Procedure

Loads setup data into temporary record on page open:

```al
local procedure InitRecord()
begin
  SetupRecord.Reset();
  if not SetupRecord.Get() then begin
    Rec.Init();
    Rec.Insert();
  end else begin
    Rec.Init();
    Rec.TransferFields(SetupRecord, false);
    Rec.Insert();
  end;
end;
```

**Logic**:
- If no setup record exists: Create empty temporary record
- If setup exists: Copy to temporary record for editing
- Rec remains temporary (user can abandon changes)

### CommitRecord Procedure

Saves temporary record changes to actual setup table:

```al
local procedure CommitRecord()
begin
  SetupRecord.Reset();
  if not SetupRecord.Get() then begin
    SetupRecord.Init();
    SetupRecord.TransferFields(Rec, false);
    SetupRecord.Insert();
  end else begin
    SetupRecord.TransferFields(Rec, false);
    SetupRecord.Modify(true);
  end;
end;
```

**Logic**:
- Transfer fields from temporary Rec to actual SetupRecord
- Insert if first-time setup, Modify if updating existing

### FinishAction Procedure

Sets completion flag and closes page (triggers commit):

```al
local procedure FinishAction()
begin
  FinishedProcess := true;
  CurrPage.Close();
end;
```

**Flow**: Sets flag → Close triggers OnQueryClosePage → Commits if flag is true

---

## Banner Loading Procedure

### LoadSetupBanner Procedure

Loads banner images from Media Repository:

```al
local procedure LoadSetupBanner()
begin
  if MediaRepositoryWIP.Get('AssistedSetup-NoText-400px.png', Format(CurrentClientType())) and
     MediaRepositoryFinished.Get('AssistedSetupDone-NoText-400px.png', Format(CurrentClientType()))
  then
    if MediaResourcesWIP.Get(MediaRepositoryWIP."Media Resources Ref") and
       MediaResourcesFinished.Get(MediaRepositoryFinished."Media Resources Ref")
    then
      BannersVisible := MediaResourcesFinished."Media Reference".HasValue();
end;
```

**Logic**:
1. Get Media Repository records by name + client type
2. Get Media Resources by reference from Media Repository
3. Set BannersVisible if media actually has content

**Note**: Image names are standard BC assets, no custom images needed.

---

## Variable Declarations

Complete variable section for wizard page:

```al
var
  SetupRecord: Record "[Prefix] [Entity] Setup";
  MediaRepositoryFinished: Record "Media Repository";
  MediaRepositoryWIP: Record "Media Repository";
  MediaResourcesFinished: Record "Media Resources";
  MediaResourcesWIP: Record "Media Resources";
  GuidedExperience: Codeunit "Guided Experience";
  Step10Visible: Boolean;
  Step20Visible: Boolean;
  Step30Visible: Boolean;
  Step40Visible: Boolean;
  BackActionEnabled: Boolean;
  NextActionEnabled: Boolean;
  FinishActionEnabled: Boolean;
  FinishedProcess: Boolean;
  BannersVisible: Boolean;
  Step: Option Step10,Step20,Step30,Step40;
```

**Naming Conventions**:
- Setup record: Named after actual table (not Rec, which is temporary)
- Step booleans: `StepXXVisible`
- Action booleans: `XxxActionEnabled`
- Step option: Values match step group names exactly

---

## Registration Codeunit

### Event Subscriber for Guided Experience

Registers wizard with BC Assisted Setup framework:

```al
codeunit [ID] "[Prefix] [Entity] Setup Management"
{
  [EventSubscriber(ObjectType::Codeunit, Codeunit::"Guided Experience", 'OnRegisterAssistedSetup', '', false, false)]
  local procedure AddSetupWizard()
  var
    AssistedSetup: Codeunit "Guided Experience";
    Language: Codeunit Language;
    CurrentGlobalLanguage: Integer;
  begin
    CurrentGlobalLanguage := GlobalLanguage;
    AssistedSetup.InsertAssistedSetup(
      SetupTxt, 
      SetupTxt, 
      SetupDescriptionTxt, 
      1000,  // Estimated time in seconds (adjust as needed)
      ObjectType::Page, 
      Page::"[Prefix] [Entity] Setup Wizard",
      "Assisted Setup Group"::DoMoreWithBC,
      DocumentationVideoUrlTxt,
      "Video Category"::DoMoreWithBC,
      DocumentationUrlTxt
    );
    GlobalLanguage(Language.GetDefaultApplicationLanguageId());
    AssistedSetup.AddTranslationForSetupObjectDescription(
      Enum::"Guided Experience Type"::"Assisted Setup", 
      ObjectType::Page, 
      Page::"[Prefix] [Entity] Setup Wizard", 
      Language.GetDefaultApplicationLanguageId(), 
      SetupTxt
    );
    GlobalLanguage(CurrentGlobalLanguage);
  end;

  local procedure GetAppId(): Guid
  var
    EmptyGuid: Guid;
  begin
    if Info.Id() = EmptyGuid then
      NavApp.GetCurrentModuleInfo(Info);
    exit(Info.Id());
  end;

  var
    Info: ModuleInfo;
    SetupTxt: Label 'Set up [Entity]';
    SetupDescriptionTxt: Label '[Brief description of what the setup does]';
    DocumentationUrlTxt: Label 'https://learn.microsoft.com/...';
    DocumentationVideoUrlTxt: Label 'https://www.youtube.com/watch?v=...';
}
```

**Parameters**:
- `SetupTxt`: Title shown in Assisted Setup
- `SetupDescriptionTxt`: Description shown in Assisted Setup
- `1000`: Time estimate in seconds (≈17 minutes, adjust as needed)
- `"Assisted Setup Group"`: Category in Assisted Setup page
  - Options: `GettingStarted`, `DoMoreWithBC`, `ReadyForBusiness`, `Extensions`, `Uncategorized`
- `DocumentationVideoUrlTxt`: YouTube or other video URL
- `"Video Category"`: Video category enum
- `DocumentationUrlTxt`: Microsoft Learn or documentation link

**Translation Support**: Adds translation for default language to ensure proper display.

---

## Complete Example

### Full 4-Step Wizard Page

```al
page 60701 "BCS StaT. Acc.Setup Wizard"
{
  ApplicationArea = All;
  Caption = '✨Statistical Account Setup Wizard✨';
  PageType = NavigatePage;
  SourceTable = "BCS Statistical Account Setup";
  SourceTableTemporary = true;

  layout
  {
    area(Content)
    {
      Group(SetupWIPBanner)
      {
        Caption = '';
        Editable = false;
        Visible = (not FinishActionEnabled) and BannersVisible;
        field(MediaRepositoryWIPField; MediaResourcesWIP."Media Reference")
        {
          ApplicationArea = All;
          Editable = false;
          ShowCaption = false;
        }
      }
      group(SetupFinishedBanner)
      {
        Caption = '';
        Editable = false;
        Visible = FinishActionEnabled and BannersVisible;
        field(MediaRepositoryFinishedField; MediaResourcesFinished."Media Reference")
        {
          ApplicationArea = All;
          Editable = false;
          ShowCaption = false;
        }
      }
      
      group(Step10)
      {
        Visible = Step10Visible;
        group(S11)
        {
          Caption = '🛠️Welcome to the Statistical Account Setup Wizard🛠️';
          InstructionalText = 'This wizard will guide you through the setup process for Statistical Accounts 🚀. 👉 Please follow the steps to configure the necessary settings.';
        }
        group(S12)
        {
          ShowCaption = false;
          InstructionalText = 'Choose Next when you are ready to start setting the module 👇 (It will be quick and painless😉.).';
        }
      }
      
      group(Step20)
      {
        Visible = Step20Visible;
        group(S21)
        {
          Caption = 'Attachments Settings 📎(Step 1/3)';
          field("Enable Attachments"; Rec."Enable Attachments")
          {
            ApplicationArea = All;
            Caption = 'Enable Attachments on Statistical Accounts';
            ToolTip = 'Specifies whether attachments are enabled on Statistical Accounts.';
          }
          field("Enable Links"; Rec."Enable Links")
          {
            ApplicationArea = All;
            Caption = 'Enable Links on Statistical Accounts';
            ToolTip = 'Specifies whether links are enabled on Statistical Accounts.';
          }
          field("Enable Notes"; Rec."Enable Notes")
          {
            ApplicationArea = All;
            Caption = 'Enable Notes on Statistical Accounts';
            ToolTip = 'Specifies whether notes are enabled on Statistical Accounts.';
          }
        }
      }
      
      group(Step30)
      {
        Visible = Step30Visible;
        group(S31)
        {
          Caption = 'Number Series Setup 🆔 (Step 2/3)';
          field("Statistical Account Nos."; Rec."Statistical Account Nos.")
          {
            ApplicationArea = All;
            Caption = 'Statistical Account Nos.';
            ToolTip = 'Specifies the number series used for Statistical Accounts.';
          }
          field("Default API Journal Temp. Name"; Rec."Default API Journal Temp. Name")
          {
            ApplicationArea = All;
            Caption = 'Default API Journal Template Name';
            ToolTip = 'Specifies the default API Journal Template Name for Statistical Accounts.';
          }
          field("Default API Journal Name"; Rec."Default API Journal Name")
          {
            ApplicationArea = All;
            Caption = 'Default API Journal Name';
            ToolTip = 'Specifies the default API Journal Name for Statistical Accounts.';
          }
          field("Default API Document No."; Rec."Default API Document No.")
          {
            ApplicationArea = All;
            Caption = 'Default API Document No.';
            ToolTip = 'Specifies the default API Document No. for Statistical Accounts.';
          }
          field("Allow API Journal Posting"; Rec."Allow API Journal Posting")
          {
            ApplicationArea = All;
            Caption = 'Allow API Journal direct Posting';
            ToolTip = 'Specifies whether to allow direct posting from the API Journal.';
          }
        }
      }
      
      group(Step40)
      {
        Visible = Step40Visible;
        group(S41)
        {
          Caption = 'Review & Finish 🧐 (Step 3/3)';
          InstructionalText = '🎉Congratulations!🎉 You have survived the setup for Statistical Accounts! 😎 Please review your settings below and click Finish to save your configuration. If you need to make any changes, use the Back👈 button to navigate to the previous steps.';
        }
        group(S42)
        {
          Caption = 'Attachments Settings 📎';
          Editable = false;
          field("Enable Attachments Review"; Rec."Enable Attachments")
          {
            ApplicationArea = All;
            Caption = 'Enable Attachments on Statistical Accounts';
            ToolTip = 'Specifies whether attachments are enabled on Statistical Accounts.';
          }
          field("Enable Links Review"; Rec."Enable Links")
          {
            ApplicationArea = All;
            Caption = 'Enable Links on Statistical Accounts';
            ToolTip = 'Specifies whether links are enabled on Statistical Accounts.';
          }
          field("Enable Notes Review"; Rec."Enable Notes")
          {
            ApplicationArea = All;
            Caption = 'Enable Notes on Statistical Accounts';
            ToolTip = 'Specifies whether notes are enabled on Statistical Accounts.';
          }
        }
        group(S43)
        {
          Caption = 'Number Series Setup 🆔';
          Editable = false;
          field("Statistical Account Nos Review"; Rec."Statistical Account Nos.")
          {
            ApplicationArea = All;
            Caption = 'Statistical Account Nos.';
            ToolTip = 'Specifies the number series used for Statistical Accounts.';
          }
        }
      }
    }
  }
  
  actions
  {
    area(Processing)
    {
      action(ActionBack)
      {
        ApplicationArea = all;
        Caption = 'Back👈';
        Enabled = BackActionEnabled;
        Image = PreviousRecord;
        InFooterBar = true;
        trigger OnAction()
        begin
          NextStep(true);
        end;
      }
      action(ActionNext)
      {
        ApplicationArea = all;
        Caption = 'Next👉';
        Enabled = NextActionEnabled;
        Image = NextRecord;
        InFooterBar = true;
        trigger OnAction()
        begin
          NextStep(false);
        end;
      }
      action(ActionFinish)
      {
        ApplicationArea = all;
        Caption = '✨Finish✨';
        Enabled = FinishActionEnabled;
        Image = Approve;
        InFooterBar = true;
        trigger OnAction()
        begin
          FinishAction();
        end;
      }
    }
  }
  
  trigger OnOpenPage()
  begin
    InitStatisticalAccountSetup();
    EnableControls();
    LoadSetupBanner();
  end;

  trigger OnQueryClosePage(CloseAction: Action): Boolean
  var
    ExitDeleteTxt: Label 'The changes will be lost☠️. Do you want to exit?🙁💔';
  begin
    if FinishedProcess then begin
      CommitStatisticalAccountSetup();
      GuidedExperience.CompleteAssistedSetup(ObjectType::Page, Page::"BCS StaT. Acc.Setup Wizard");
    end else
      if GuiAllowed and not (Confirm(ExitDeleteTxt)) then
        Error('');
  end;

  local procedure ResetControls()
  begin
    FinishActionEnabled := false;
    BackActionEnabled := true;
    NextActionEnabled := true;

    Step10Visible := false;
    Step20Visible := false;
    Step30Visible := false;
    Step40Visible := false;
  end;

  local procedure NextStep(Backwards: Boolean)
  begin
    if Backwards then
      Step := Step - 1
    else
      Step := Step + 1;

    EnableControls();
  end;

  local procedure EnableControls()
  begin
    ResetControls();

    case Step of
      Step::Step10:
        SetControlsStep10();
      Step::Step20:
        SetControlsStep20();
      Step::Step30:
        SetControlsStep30();
      Step::Step40:
        SetControlsStep40();
    end;
  end;

  local procedure SetControlsStep10()
  begin
    Step10Visible := true;
    FinishActionEnabled := false;
    BackActionEnabled := false;
  end;

  local procedure SetControlsStep20()
  begin
    Step20Visible := true;
  end;

  local procedure SetControlsStep30()
  begin
    Step30Visible := true;
  end;

  local procedure SetControlsStep40()
  begin
    Step40Visible := true;
    NextActionEnabled := false;
    FinishActionEnabled := true;
  end;

  local procedure FinishAction()
  begin
    FinishedProcess := true;
    CurrPage.Close();
  end;

  local procedure CommitStatisticalAccountSetup()
  begin
    BCSStatisticalAccountSetup.Reset();
    if not BCSStatisticalAccountSetup.Get() then begin
      BCSStatisticalAccountSetup.Init();
      BCSStatisticalAccountSetup.TransferFields(Rec, false);
      BCSStatisticalAccountSetup.Insert();
    end else begin
      BCSStatisticalAccountSetup.TransferFields(Rec, false);
      BCSStatisticalAccountSetup.Modify(true);
    end;
  end;

  local procedure InitStatisticalAccountSetup()
  begin
    BCSStatisticalAccountSetup.Reset();
    if not BCSStatisticalAccountSetup.Get() then begin
      Rec.Init();
      Rec.Insert();
    end else begin
      Rec.Init();
      Rec.TransferFields(BCSStatisticalAccountSetup, false);
      Rec.Insert();
    end;
  end;

  local procedure LoadSetupBanner()
  begin
    if MediaRepositoryWIP.Get('AssistedSetup-NoText-400px.png', Format(CurrentClientType())) and
       MediaRepositoryFinished.Get('AssistedSetupDone-NoText-400px.png', Format(CurrentClientType()))
    then
      if MediaResourcesWIP.Get(MediaRepositoryWIP."Media Resources Ref") and
         MediaResourcesFinished.Get(MediaRepositoryFinished."Media Resources Ref")
      then
        BannersVisible := MediaResourcesFinished."Media Reference".HasValue();
  end;

  var
    BCSStatisticalAccountSetup: Record "BCS Statistical Account Setup";
    MediaRepositoryFinished: Record "Media Repository";
    MediaRepositoryWIP: Record "Media Repository";
    MediaResourcesFinished: Record "Media Resources";
    MediaResourcesWIP: Record "Media Resources";
    GuidedExperience: Codeunit "Guided Experience";
    Step10Visible: Boolean;
    Step20Visible: Boolean;
    Step30Visible: Boolean;
    Step40Visible: Boolean;
    BackActionEnabled: Boolean;
    NextActionEnabled: Boolean;
    FinishActionEnabled: Boolean;
    FinishedProcess: Boolean;
    BannersVisible: Boolean;
    Step: Option Step10,Step20,Step30,Step40;
}
```

### Complete Registration Codeunit

```al
codeunit 60701 "BCS Stat. Acc.Setup Management"
{
  [EventSubscriber(ObjectType::Codeunit, Codeunit::"Guided Experience", 'OnRegisterAssistedSetup', '', false, false)]
  local procedure AddGeneralLedgerSetupWizard()
  var
    AssistedSetup: Codeunit "Guided Experience";
    Language: Codeunit Language;
    CurrentGlobalLanguage: Integer;
  begin
    CurrentGlobalLanguage := GlobalLanguage;
    AssistedSetup.InsertAssistedSetup(
      SetupTxt, 
      SetupTxt, 
      SetupDescriptionTxt, 
      1000, 
      ObjectType::Page, 
      Page::"BCS StaT. Acc.Setup Wizard",
      "Assisted Setup Group"::DoMoreWithBC,
      DocumentationVideoUrlTxt,
      "Video Category"::DoMoreWithBC,
      DocumentationUrlTxt
    );
    GlobalLanguage(Language.GetDefaultApplicationLanguageId());
    AssistedSetup.AddTranslationForSetupObjectDescription(
      Enum::"Guided Experience Type"::"Assisted Setup", 
      ObjectType::Page, 
      Page::"BCS StaT. Acc.Setup Wizard", 
      Language.GetDefaultApplicationLanguageId(), 
      SetupTxt
    );
    GlobalLanguage(CurrentGlobalLanguage);
  end;

  local procedure GetAppId(): Guid
  var
    EmptyGuid: Guid;
  begin
    if Info.Id() = EmptyGuid then
      NavApp.GetCurrentModuleInfo(Info);
    exit(Info.Id());
  end;

  var
    Info: ModuleInfo;
    SetupTxt: Label 'Set up Statistical Accounts';
    SetupDescriptionTxt: Label 'Statistical accounts let you add metrics that are based on non-transactional data.';
    DocumentationUrlTxt: Label 'https://learn.microsoft.com/en-us/dynamics365/business-central/bi-use-statistical-accounts';
    DocumentationVideoUrlTxt: Label 'https://www.youtube.com/watch?v=edGJn3IzS8o&list=OLAK5uy_loMTyCCFteD6M6QIcNNbmpY6lyADQl-LQ&index=8';
}
```

---

## Tips and Best Practices

### Naming Conventions

- **Page**: `[Prefix] [Entity] Setup Wizard`
- **Codeunit**: `[Prefix] [Entity] Setup Management`
- **Step Groups**: `Step10`, `Step20`, `Step30`, etc. (increments of 10)
- **Subgroups**: `S11`, `S12`, `S21`, etc. (first digit = step, second = subgroup)
- **Variables**: 
  - `StepXXVisible` (boolean per step)
  - `XxxActionEnabled` (boolean per action)
  - `Step` (Option variable with values matching step names)

### Step Numbering

Use increments of 10 (Step10, Step20, Step30) to allow easy insertion of new steps between existing ones without renaming everything.

### Caption Best Practices

- Include emoji for visual appeal: ✨🛠️📎🆔🧐🎉
- Show progress on configuration steps: `(Step 1/3)`, `(Step 2/3)`
- Keep final step caption consistent: `(Step X/X)` where X is same number

### InstructionalText Guidelines

- Welcome step: Explain purpose and what user will accomplish
- Configuration steps: Use brief captions instead of long InstructionalText
- Review step: Congratulate and remind about Back button for changes

### Field Duplication on Review Step

Review step shows same fields as configuration steps but read-only. Must use unique field names by appending "Review" suffix to avoid compilation errors.

### Media Repository Images

Standard BC includes these images - no custom images needed:
- `AssistedSetup-NoText-400px.png` (WIP banner)
- `AssistedSetupDone-NoText-400px.png` (Finished banner)

### Validation

Add field validation in OnValidate triggers if needed, or create validation codeunit procedures called from wizard.

### Multi-Record Setup

If setup has multiple records (not single setup record), adjust InitRecord and CommitRecord to use FindFirst/FindLast or pass key values.

### Waldo's Snippet

Use extension [waldo's CRS AL Language Extension](https://marketplace.visualstudio.com/items?itemName=waldo.crs-al-language-extension) snippet `tpagewizard3stepswaldo` for rapid scaffolding, then customize.

---

## Testing Checklist

- [ ] Wizard appears in Assisted Setup page
- [ ] Wizard appears in Extension Management (Setup actions)
- [ ] Welcome step shows on open, Back disabled
- [ ] Next navigates forward through steps
- [ ] Back navigates backward through steps
- [ ] Review step disables Next, enables Finish
- [ ] Review step fields are read-only
- [ ] Banners display correctly (WIP on config, Finished on review)
- [ ] Closing without finish prompts confirmation
- [ ] Closing with finish saves changes
- [ ] Completion check marked after finish
- [ ] Setup table contains saved values after finish
- [ ] Documentation links work (if provided)
- [ ] Video URL works (if provided)
- [ ] Translation works for default language
