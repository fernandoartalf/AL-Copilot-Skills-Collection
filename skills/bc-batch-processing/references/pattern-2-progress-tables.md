# Pattern 2: Progress Tracking Tables

## Problem

Users have no visibility into:
- How much progress has been made
- How long the process will take
- Which tables are complete vs pending
- Historical execution data for troubleshooting

## Solution

Create dedicated tracking tables:
1. **Progress Table**: Tracks per-table completion status with time estimates
2. **Execution Log Table**: Historical record of each batch execution

## Progress Table Schema

```al
table 50100 "Batch Sync Progress"
{
    Caption = 'Batch Sync Progress';
    DataClassification = SystemMetadata;

    fields
    {
        field(1; "Table ID"; Integer)
        {
            Caption = 'Table ID';
        }
        field(2; "Table Name"; Text[100])
        {
            Caption = 'Table Name';
        }
        field(10; "Total Records"; Integer)
        {
            Caption = 'Total Records';
        }
        field(11; "Processed Records"; Integer)
        {
            Caption = 'Processed Records';
        }
        field(12; "Remaining Records"; Integer)
        {
            Caption = 'Remaining Records';
            Editable = false;
        }
        field(13; "Progress %"; Decimal)
        {
            Caption = 'Progress %';
            DecimalPlaces = 2 : 2;
            Editable = false;
        }
        field(20; Status; Option)
        {
            OptionMembers = "Not Started","In Progress","Completed";
            OptionCaption = 'Not Started,In Progress,Completed';
        }
        field(30; "Started At"; DateTime) { }
        field(31; "Completed At"; DateTime) { }
        field(32; "Last Execution At"; DateTime) { }
        
        // Calculated time estimates
        field(40; "Avg Records Per Minute"; Decimal)
        {
            DecimalPlaces = 0 : 2;
            Editable = false;
        }
        field(41; "Estimated Minutes Remaining"; Decimal)
        {
            DecimalPlaces = 0 : 2;
            Editable = false;
        }
        field(42; "Estimated Completion Time"; DateTime)
        {
            Editable = false;
        }
    }

    keys
    {
        key(PK; "Table ID") { Clustered = true; }
    }

    trigger OnModify()
    begin
        UpdateCalculatedFields();
    end;

    local procedure UpdateCalculatedFields()
    var
        ElapsedMinutes: Decimal;
    begin
        // Calculate remaining
        "Remaining Records" := "Total Records" - "Processed Records";

        // Calculate progress %
        if "Total Records" > 0 then
            "Progress %" := Round(("Processed Records" / "Total Records") * 100, 0.01);

        // Calculate speed and ETA
        if ("Processed Records" > 0) and ("Started At" <> 0DT) then begin
            ElapsedMinutes := (CurrentDateTime - "Started At") / 60000;
            if ElapsedMinutes > 0 then begin
                "Avg Records Per Minute" := Round("Processed Records" / ElapsedMinutes, 0.01);
                
                if "Avg Records Per Minute" > 0 then begin
                    "Estimated Minutes Remaining" := Round("Remaining Records" / "Avg Records Per Minute", 0.01);
                    "Estimated Completion Time" := CurrentDateTime + ("Estimated Minutes Remaining" * 60000);
                end;
            end;
        end;

        // Update status
        if "Remaining Records" = 0 then begin
            Status := Status::Completed;
            if "Completed At" = 0DT then
                "Completed At" := CurrentDateTime;
        end else if "Processed Records" > 0 then
            Status := Status::"In Progress";
    end;

    procedure Initialize(TableID: Integer; TableCaption: Text[100]; TotalRecs: Integer)
    begin
        "Table ID" := TableID;
        "Table Name" := TableCaption;
        "Total Records" := TotalRecs;
        "Processed Records" := 0;
        Status := Status::"Not Started";
        "Started At" := CurrentDateTime;
        UpdateCalculatedFields();
    end;

    procedure IncrementProcessed(RecordsProcessed: Integer)
    begin
        "Processed Records" += RecordsProcessed;
        "Last Execution At" := CurrentDateTime;
        UpdateCalculatedFields();
        Modify(true);
    end;
}
```

## Execution Log Table Schema

```al
table 50101 "Batch Sync Execution Log"
{
    Caption = 'Batch Sync Execution Log';
    DataClassification = SystemMetadata;

    fields
    {
        field(1; "Entry No."; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "Company Name"; Text[30]) { }
        field(10; "Execution Started At"; DateTime) { }
        field(11; "Execution Ended At"; DateTime) { }
        field(12; "Duration (Minutes)"; Decimal)
        {
            DecimalPlaces = 2 : 2;
        }
        field(20; "Total Processed"; Integer) { }
        field(21; "Batch Limit Reached"; Boolean) { }
        
        // Per-table counters (customize for your tables)
        field(30; "Table1 Count"; Integer) { }
        field(31; "Table2 Count"; Integer) { }
        field(32; "Table3 Count"; Integer) { }
        // Add more fields as needed
        
        field(50; "User ID"; Code[50])
        {
            DataClassification = EndUserIdentifiableInformation;
        }
        field(51; "Executed From Job Queue"; Boolean) { }
    }

    keys
    {
        key(PK; "Entry No.") { Clustered = true; }
        key(ExecutionDate; "Execution Started At") { }
    }

    procedure LogExecution(
        StartedAt: DateTime;
        EndedAt: DateTime;
        TotalProc: Integer;
        BatchLimitReached: Boolean;
        Count1: Integer;
        Count2: Integer;
        Count3: Integer)
    var
        DurationMs: Duration;
    begin
        Init();
        "Company Name" := CompanyName();
        "Execution Started At" := StartedAt;
        "Execution Ended At" := EndedAt;
        
        DurationMs := EndedAt - StartedAt;
        "Duration (Minutes)" := Round(DurationMs / 60000, 0.01);
        
        "Total Processed" := TotalProc;
        "Batch Limit Reached" := BatchLimitReached;
        "Table1 Count" := Count1;
        "Table2 Count" := Count2;
        "Table3 Count" := Count3;
        
        "User ID" := CopyStr(UserId(), 1, 50);
        "Executed From Job Queue" := not GuiAllowed;
        
        Insert(true);
    end;
}
```

## Time Estimation Algorithm

The progress table automatically calculates:

### 1. Average Speed
```al
Avg Records Per Minute = Processed Records / Elapsed Minutes
```

**Example**: 150,000 records processed in 90 minutes → 1,667 records/min

### 2. Estimated Time Remaining
```al
Estimated Minutes Remaining = Remaining Records / Avg Records Per Minute
```

**Example**: 2,350,000 remaining ÷ 1,667 rec/min → 1,410 minutes (23.5 hours)

### 3. Estimated Completion Time
```al
Estimated Completion Time = Current Time + Estimated Minutes Remaining
```

**Example**: Now (Mon 14:00) + 23.5 hours → Tue 13:30

## Initialization Pattern

**Critical**: Only count records ONCE (first execution), don't recount every time.

```al
local procedure InitializeProgressTracking()
var
    Progress: Record "Batch Sync Progress";
    Table1: Record "My Table 1";
    Table2: Record "My Table 2";
begin
    // Exit if already initialized
    if Progress.FindFirst() then
        exit;

    // Table 1: Count only unprocessed
    if not Progress.Get(Database::"My Table 1") then begin
        Table1.SetRange("Status Field", '');  // Filter before Count()
        Progress.Initialize(Database::"My Table 1", 'My Table 1', Table1.Count());
        Progress.Insert(true);
    end;

    // Table 2: Count only unprocessed
    if not Progress.Get(Database::"My Table 2") then begin
        Table2.SetRange("Status Field", '');
        Progress.Initialize(Database::"My Table 2", 'My Table 2', Table2.Count());
        Progress.Insert(true);
    end;
end;
```

## Update Pattern

Called after each table is processed in a batch:

```al
local procedure UpdateProgress(TableID: Integer; RecordsProcessed: Integer)
var
    Progress: Record "Batch Sync Progress";
begin
    if RecordsProcessed = 0 then
        exit;

    if Progress.Get(TableID) then
        Progress.IncrementProcessed(RecordsProcessed);
    // IncrementProcessed() calls UpdateCalculatedFields() and Modify(true)
end;
```

## Example Data Flow

### Execution 1 (First run)
```
InitializeProgressTracking():
  Sales Header: Total = 12,345, Processed = 0, Remaining = 12,345
  Sales Line: Total = 550,000, Processed = 0, Remaining = 550,000

ProcessSalesHeader():
  12,345 records → all processed
  UpdateProgress(36, 12,345)
  → Progress %: 100%, Status: Completed

ProcessSalesLine():
  Processes 37,655 records (batch limit reached at 50,000 total)
  UpdateProgress(37, 37,655)
  → Progress %: 6.8%, Avg: 1,255 rec/min, ETA: 6.8 hours

LogExecution():
  Total Processed: 50,000
  Sales Header: 12,345
  Sales Line: 37,655
  Batch Limit Reached: Yes
  Duration: 30 minutes
```

### Execution 2 (30 minutes later)
```
InitializeProgressTracking():
  Already initialized → exit

ProcessSalesLine():
  Processes 50,000 more records
  UpdateProgress(37, 50,000)
  → Progress %: 15.9%, Avg: 1,375 rec/min, ETA: 5.5 hours

LogExecution():
  Total Processed: 50,000
  Sales Line: 50,000
  Batch Limit Reached: Yes
  Duration: 36 minutes
```

## Post-Migration Cleanup

After all processing completes:

```sql
-- Option A: Truncate (keeps tables for future use)
DELETE FROM "Batch Sync Progress";
DELETE FROM "Batch Sync Execution Log";

-- Option B: Drop tables (remove completely)
-- 1. Remove table objects from AL project
-- 2. Remove page objects
-- 3. Publish new version (tables dropped automatically)
```

## Benefits

1. **Real-time visibility**: Users see progress % and ETA
2. **Historical audit**: Complete log of every execution
3. **Troubleshooting**: Identify slow tables or failed runs
4. **Performance tracking**: Average speed per table
5. **User confidence**: "3 hours remaining" vs "no idea"

## Related Patterns

- Pattern 1: Batch-Limited Report (what updates these tables)
- Pattern 3: Report Integration (how report calls these tables)
- Pattern 5: Progress Monitoring Pages (how users view this data)
