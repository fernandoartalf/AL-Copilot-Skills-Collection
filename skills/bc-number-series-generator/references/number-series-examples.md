# Number Series Examples

Complete working examples demonstrating number series implementation patterns in Business Central.

## Example 1: Statistical Accounts (Simple Single Series)

This example extends Microsoft's Statistical Accounts extension to add automatic number series.

### Setup Table

```al
table 60700 "BCS Statistical Account Setup"
{
    Caption = 'Statistical Account Setup';
    DataClassification = ToBeClassified;
    DrillDownPageID = "BCS Statistical Account Setup";
    LookupPageID = "BCS Statistical Account Setup";
    
    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            AllowInCustomizations = Never;
            Caption = 'Primary Key';
        }
        field(2; "Statistical Account Nos."; Code[20])
        {
            Caption = 'Statistical Account Nos.';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
    }
    
    keys
    {
        key(Key1; "Primary Key")
        {
            Clustered = true;
        }
    }
}
```

### Setup Page

```al
page 60700 "BCS Statistical Account Setup"
{
    ApplicationArea = Basic, Suite;
    Caption = 'Statistical Account Setup';
    PageType = Card;
    SourceTable = "BCS Statistical Account Setup";
    DeleteAllowed = false;
    InsertAllowed = false;
    UsageCategory = Administration;
    
    layout
    {
        area(Content)
        {
            group("Number Series")
            {
                Caption = 'Number Series';
                field("Statistical Account Nos."; Rec."Statistical Account Nos.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the number series used for Statistical Accounts.';
                }
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

### Table Extension

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
    
    trigger OnBeforeInsert()
    begin
        if "No." = '' then begin
            BCSStatisticalAccountSetup.Get();
            BCSStatisticalAccountSetup.TestField("Statistical Account Nos.");
            if NoSeries.AreRelated(BCSStatisticalAccountSetup."Statistical Account Nos.", xRec."BCS No. Series") then
                "BCS No. Series" := xRec."BCS No. Series"
            else
                "BCS No. Series" := BCSStatisticalAccountSetup."Statistical Account Nos.";
            "No." := NoSeries.GetNextNo("BCS No. Series");
        end;
    end;
    
    trigger OnBeforeRename()
    begin
        if "No." = '' then begin
            BCSStatisticalAccountSetup.Get();
            BCSStatisticalAccountSetup.TestField("Statistical Account Nos.");
            if NoSeries.AreRelated(BCSStatisticalAccountSetup."Statistical Account Nos.", Rec."BCS No. Series") then
                "BCS No. Series" := Rec."BCS No. Series"
            else
                "BCS No. Series" := BCSStatisticalAccountSetup."Statistical Account Nos.";
            "No." := NoSeries.GetNextNo("BCS No. Series");
        end;
    end;
    
    procedure AssistEdit(): Boolean
    begin
        if not BCSStatisticalAccountSetup.Get() then
            exit(false);
        if NoSeries.LookupRelatedNoSeries(BCSStatisticalAccountSetup."Statistical Account Nos.", xRec."BCS No. Series", "BCS No. Series") then
            "No." := NoSeries.GetNextNo("BCS No. Series");
    end;
    
    var
        BCSStatisticalAccountSetup: Record "BCS Statistical Account Setup";
        NoSeries: Codeunit "No. Series";
}
```

### Page Extension

```al
pageextension 60700 "BCS Statistical Account Card" extends "Statistical Account Card"
{
    layout
    {
        modify("No.")
        {
            trigger OnAssistEdit()
            begin
                if Rec.AssistEdit() then
                    CurrPage.Update();
            end;
        }
    }
}
```

### User Experience Flow

1. **Initial Setup**: User opens "BCS Statistical Account Setup" page via search
2. **Configure Series**: User selects "STAT" series for "Statistical Account Nos." field
3. **Create Account**: User opens "Statistical Account Card" and clicks New
4. **Automatic Numbering**: System automatically assigns next number (e.g., STAT-0001) from configured series
5. **Manual Override**: User can manually enter a different number if needed
6. **AssistEdit**: User can press F6 on "No." field to select from related series (e.g., STAT, STAT-MANUAL)

---

## Example 2: Multiple Series per Module

This pattern demonstrates multiple number series in a single setup table for different entity types.

### Setup Table

```al
table 60710 "BCS Project Management Setup"
{
    Caption = 'Project Management Setup';
    DataClassification = ToBeClassified;
    
    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            AllowInCustomizations = Never;
            Caption = 'Primary Key';
        }
        field(10; "Internal Project Nos."; Code[20])
        {
            Caption = 'Internal Project Nos.';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
        field(11; "External Project Nos."; Code[20])
        {
            Caption = 'External Project Nos.';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
        field(20; "Task Nos."; Code[20])
        {
            Caption = 'Task Nos.';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
        field(21; "Milestone Nos."; Code[20])
        {
            Caption = 'Milestone Nos.';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
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

### Table Extension with Conditional Logic

```al
tableextension 60710 "BCS Project" extends "Custom Project Table"
{
    fields
    {
        field(60710; "BCS No. Series"; Code[20])
        {
            Caption = 'No. Series';
            DataClassification = ToBeClassified;
            TableRelation = "No. Series";
        }
    }
    
    trigger OnBeforeInsert()
    var
        SeriesCode: Code[20];
    begin
        if "No." = '' then begin
            ProjectSetup.Get();
            
            // Select series based on project type
            case "Project Type" of
                "Project Type"::Internal:
                    begin
                        ProjectSetup.TestField("Internal Project Nos.");
                        SeriesCode := ProjectSetup."Internal Project Nos.";
                    end;
                "Project Type"::External:
                    begin
                        ProjectSetup.TestField("External Project Nos.");
                        SeriesCode := ProjectSetup."External Project Nos.";
                    end;
            end;
            
            if NoSeries.AreRelated(SeriesCode, xRec."BCS No. Series") then
                "BCS No. Series" := xRec."BCS No. Series"
            else
                "BCS No. Series" := SeriesCode;
                
            "No." := NoSeries.GetNextNo("BCS No. Series");
        end;
    end;
    
    procedure AssistEdit(): Boolean
    var
        SeriesCode: Code[20];
    begin
        if not ProjectSetup.Get() then
            exit(false);
            
        case "Project Type" of
            "Project Type"::Internal:
                SeriesCode := ProjectSetup."Internal Project Nos.";
            "Project Type"::External:
                SeriesCode := ProjectSetup."External Project Nos.";
        end;
        
        if NoSeries.LookupRelatedNoSeries(SeriesCode, xRec."BCS No. Series", "BCS No. Series") then begin
            "No." := NoSeries.GetNextNo("BCS No. Series");
            exit(true);
        end;
    end;
    
    var
        ProjectSetup: Record "BCS Project Management Setup";
        NoSeries: Codeunit "No. Series";
}
```

### Key Differences

- **Multiple series fields** in setup table (Internal, External, Tasks, Milestones)
- **Conditional logic** in OnBeforeInsert based on record field (Project Type)
- **AssistEdit adapts** to show appropriate related series based on type
- **Single setup page** manages all series configurations

---

## Example 3: API Integration with Number Series

Number series can also be used in API scenarios for automatic document numbering.

### API Document Numbering

```al
page 60720 "BCS Stat Acc Journal API"
{
    APIVersion = 'v2.0';
    APIPublisher = 'bcscout';
    APIGroup = 'statistical';
    EntityCaption = 'Statistical Account Journal Line';
    EntitySetCaption = 'Statistical Account Journal Lines';
    EntityName = 'statisticalAccountJournalLine';
    EntitySetName = 'statisticalAccountJournalLines';
    PageType = API;
    SourceTable = "Statistical Acc. Journal Line";
    DelayedInsert = true;
    ODataKeyFields = SystemId;
    Extensible = false;
    
    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                    Editable = false;
                }
                field(documentNumber; Rec."Document No.")
                {
                    Caption = 'Document Number';
                }
                // ... other fields
            }
        }
    }
    
    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        BCSStatAccJournalMgmt.InitializeAPIJournalLine(Rec);
    end;
}
```

### API Number Series Management Codeunit

```al
codeunit 60720 "BCS Stat Acc Journal Mgmt"
{
    procedure InitializeAPIJournalLine(var StatisticalAccJournalLine: Record "Statistical Acc. Journal Line")
    begin
        if not BCSStatisticalAccountSetup.Get() then
            exit;
            
        if StatisticalAccJournalLine."Journal Template Name" = '' then
            StatisticalAccJournalLine."Journal Template Name" := BCSStatisticalAccountSetup."Default API Journal Temp. Name";
            
        if StatisticalAccJournalLine."Journal Batch Name" = '' then
            StatisticalAccJournalLine."Journal Batch Name" := BCSStatisticalAccountSetup."Default API Journal Name";
        
        // Automatically assign document number if not provided
        if StatisticalAccJournalLine."Document No." = '' then
            StatisticalAccJournalLine."Document No." := NoSeries.GetNextNo(BCSStatisticalAccountSetup."Default API Document No.");
    end;
    
    var
        BCSStatisticalAccountSetup: Record "BCS Statistical Account Setup";
        NoSeries: Codeunit "No. Series";
}
```

### API Usage Pattern

**POST Request** (without document number):
```json
{
  "statisticalAccountNo": "STAT-0001",
  "amount": 1000,
  "postingDate": "2026-03-22"
}
```

**System automatically assigns**:
- `documentNumber`: "API-DOC-0001" (from setup)
- `journalTemplateName`: Default API template
- `journalBatchName`: Default API batch

**Result**: Seamless API integration with automatic document numbering matching BC conventions.

---

## Example 4: Wizard-Based Setup

For complex modules, a setup wizard can guide users through number series configuration.

### Setup Wizard Page

```al
page 60730 "BCS Stat Acc Setup Wizard"
{
    Caption = 'Statistical Account Setup Wizard';
    PageType = NavigatePage;
    SourceTable = "BCS Statistical Account Setup";
    
    layout
    {
        area(content)
        {
            group(Step1)
            {
                Caption = 'Welcome';
                Visible = Step = Step::Welcome;
                
                group(WelcomeMessage)
                {
                    Caption = '';
                    InstructionalText = 'This wizard helps you configure number series for Statistical Accounts.';
                }
            }
            
            group(Step2)
            {
                Caption = 'Number Series';
                Visible = Step = Step::NumberSeries;
                
                field("Statistical Account Nos."; Rec."Statistical Account Nos.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the number series used for Statistical Accounts.';
                    
                    trigger OnValidate()
                    begin
                        EnableNextButton();
                    end;
                }
                
                group(SeriesHelp)
                {
                    Caption = '';
                    InstructionalText = 'Select the number series for automatic numbering. You can create a new series if needed.';
                }
            }
            
            group(Step3)
            {
                Caption = 'Finish';
                Visible = Step = Step::Finish;
                
                group(FinishMessage)
                {
                    Caption = '';
                    InstructionalText = 'Setup is complete! You can now create Statistical Accounts with automatic numbering.';
                }
            }
        }
    }
    
    actions
    {
        area(processing)
        {
            action(ActionBack)
            {
                Caption = 'Back';
                Image = PreviousRecord;
                InFooterBar = true;
                Enabled = BackEnabled;
                
                trigger OnAction()
                begin
                    NextStep(true);
                end;
            }
            
            action(ActionNext)
            {
                Caption = 'Next';
                Image = NextRecord;
                InFooterBar = true;
                Enabled = NextEnabled;
                
                trigger OnAction()
                begin
                    NextStep(false);
                end;
            }
            
            action(ActionFinish)
            {
                Caption = 'Finish';
                Image = Approve;
                InFooterBar = true;
                Enabled = FinishEnabled;
                
                trigger OnAction()
                begin
                    FinishAction();
                end;
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
        
        Step := Step::Welcome;
        EnableControls();
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
        BackEnabled := Step > Step::Welcome;
        NextEnabled := (Step < Step::Finish) and CanGoNext();
        FinishEnabled := Step = Step::Finish;
    end;
    
    local procedure CanGoNext(): Boolean
    begin
        case Step of
            Step::Welcome:
                exit(true);
            Step::NumberSeries:
                exit(Rec."Statistical Account Nos." <> '');
        end;
    end;
    
    local procedure EnableNextButton()
    begin
        EnableControls();
    end;
    
    local procedure FinishAction()
    begin
        Rec.Modify();
        CurrPage.Close();
    end;
    
    var
        Step: Option Welcome,NumberSeries,Finish;
        BackEnabled: Boolean;
        NextEnabled: Boolean;
        FinishEnabled: Boolean;
}
```

### Wizard Benefits

- **Guided experience** for first-time setup
- **Validation** at each step before proceeding
- **Help text** explains each configuration
- **Finish action** saves settings and closes wizard

---

## Testing Checklist

For all number series implementations, verify:

### Automatic Numbering

- [ ] Create new record with blank "No." field
- [ ] Verify system assigns next number from configured series
- [ ] Check series counter increments correctly

### Manual Override

- [ ] Create new record and manually enter "No."
- [ ] Verify system accepts manual number
- [ ] Confirm no series counter unchanged (manual entry doesn't consume series number)

### AssistEdit Functionality

- [ ] Press F6 or click AssistEdit button on "No." field
- [ ] Verify lookup shows only related series
- [ ] Select different series and confirm new number assigned

### Related Series

- [ ] Configure related series (e.g., STAT and STAT-MANUAL with relationship)
- [ ] Create record using STAT-MANUAL series via AssistEdit
- [ ] Verify subsequent records continue using STAT-MANUAL (respects user choice)

### Setup Validation

- [ ] Clear series field in setup
- [ ] Attempt to create new record
- [ ] Verify TestField error with clear message

### Rename Handling

- [ ] Create record with automatic number
- [ ] Attempt to rename (if applicable)
- [ ] Verify OnBeforeRename trigger handles numbering correctly

### API Integration (if applicable)

- [ ] POST new record via API without "No."
- [ ] Verify automatic numbering works via API
- [ ] POST with explicit "No." and verify manual number accepted
