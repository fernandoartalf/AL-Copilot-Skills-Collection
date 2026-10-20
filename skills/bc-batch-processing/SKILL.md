---
name: skill-batch-processing
description: "AL batch processing patterns for Business Central. Use when processing large datasets with reports, implementing progress tracking, Job Queue integration, or handling multi-million record updates that may timeout."
---

# Skill: AL Batch Processing & Progress Tracking

## Purpose

Design and implement batch processing reports that can handle millions of records without timeouts, with progress tracking, time estimation, and Job Queue automation for Business Central.

## When to Load

This skill should be loaded when:
- A report needs to process more than 100,000 records and may timeout
- Long-running data migration or synchronization is required
- Progress tracking and time estimation are needed for user visibility
- A process must run automatically via Job Queue without manual intervention
- Post-migration data cleanup or one-time bulk updates are needed
- Users need to monitor multi-day processing operations

## Quick Start

### Minimal Implementation (3 objects)

1. **Batch-limited report** - Processes 50K records per run, exits cleanly
2. **Job Queue entry** - Auto-reruns every 30 minutes
3. **Filter unprocessed** - Only loads records needing update

```al
report 50000 "Batch Update"
{
    trigger OnPreReport()
    begin
        BatchSize := 50000;
        BatchLimitReached := false;
    end;

    local procedure ProcessRecords()
    var
        Rec: Record "My Table";
    begin
        Rec.SetLoadFields("No.", "Field to Update", "Status");
        Rec.SetRange("Status", '');  // Unprocessed only
        
        if Rec.FindSet(true) then
            repeat
                Rec."Field to Update" := CalculateSomething(Rec);
                Rec."Status" := 'DONE';
                Rec.Modify(false);
                
                Counter += 1;
                if Counter >= BatchSize then begin
                    BatchLimitReached := true;
                    exit;
                end;
            until Rec.Next() = 0;
    end;
}
```

### Complete Implementation (7 objects)

Add progress tracking for visibility:

- 2 tracking tables (Progress + Execution Log)
- 2 monitoring pages (Progress List + Log List)
- 1 FactBox page (Recent Executions)

**Result**: Real-time progress, time estimates, execution history.

---

## Core Patterns

Detailed documentation in `references/` folder:

### Pattern 1: Batch-Limited Report with Auto-Resume

**File**: [`references/pattern-1-batch-limiting.md`](references/pattern-1-batch-limiting.md)

**Summary**: Process records in batches (10K-100K) with automatic resumption. Exit cleanly when limit reached, allowing Job Queue to re-run.

**Key points**:
- Batch size: 10K-100K depending on complexity
- Filter unprocessed records first (SetRange)
- Exit early when batch limit reached
- Performance: SetLoadFields + Modify(false)

**Use when**: Any operation that could timeout (>100K records)

---

### Pattern 2: Progress Tracking Tables

**File**: [`references/pattern-2-progress-tables.md`](references/pattern-2-progress-tables.md)

**Summary**: Create dedicated tables to track per-table completion status with time estimates and execution history.

**Tables**:
1. **Progress Table**: Tracks completion %, records remaining, ETA per table
2. **Execution Log**: Historical record of each batch execution

**Calculated fields**:
- Avg Records Per Minute
- Estimated Minutes Remaining
- Estimated Completion Time

**Use when**: Users need visibility into multi-day operations

---

### Pattern 3: Report Integration with Progress Tracking

**Summary**: Integrate batch report with tracking tables.

**Flow**:
1. **OnPreReport**: Initialize progress table (count totals once)
2. **Each Sync procedure**: Update progress after processing
3. **OnPostReport**: Log execution with all counters

**Example**:
```al
trigger OnPreReport()
begin
    InitializeProgressTracking();  // Only first time
    ProcessTable1();
    ProcessTable2();
end;

local procedure ProcessTable1()
begin
    // ... process records
    UpdateProgress(Database::"Table1", CountTable1);
end;

trigger OnPostReport()
begin
    ExecutionLog.LogExecution(StartTime, CurrentDateTime, TotalProcessed, ...);
end;
```

**Use when**: Implementing complete batch processing with visibility

---

### Pattern 4: Job Queue Integration

**File**: [`references/pattern-4-job-queue.md`](references/pattern-4-job-queue.md)

**Summary**: Configure Job Queue to automatically re-run report every 30 minutes until complete.

**Requirements**:
1. **GuiAllowed protection** - All UI calls wrapped
2. **Silent execution** - No blocking prompts
3. **Clean exit** - No Error() on batch limit

**Job Queue setup**:
```
Object Type: Report
Object ID: 50000
Recurring: Yes
Minutes Between Runs: 30
Max Attempts: 100
Starting Time: 22:00 (nights only)
```

**Use when**: Multi-day automated processing needed

---

### Pattern 5: Progress Monitoring Pages

**Summary**: User-facing pages to view real-time progress.

**Pages**:
1. **Progress List** - Shows per-table completion with color coding
2. **Execution Log List** - Historical executions with statistics
3. **FactBox** - Recent executions in side panel

**Features**:
- Color-coded progress (green/yellow/red)
- Estimated completion time
- Refresh action
- Run report action

**Use when**: Users need to monitor batch operations

---

## Anti-Patterns (Avoid These)

**File**: [`references/anti-patterns.md`](references/anti-patterns.md)

Common mistakes that cause timeouts or poor performance:

1. ❌ **Processing all records every time** (no filter on unprocessed)
2. ❌ **No batch limit** (processes millions in one go → timeout)
3. ❌ **Blocking Job Queue** (unprotected Confirm/Message calls)
4. ❌ **Recounting total every execution** (slow COUNT(*) repeated)
5. ❌ **Loading all fields** (SetLoadFields missing)
6. ❌ **Updating UI every record** (should update every 100)
7. ❌ **No error handling** (one bad record stops entire batch)

**Impact**: With anti-patterns, processes timeout after 12+ hours. With patterns applied, complete in ~10 min/batch with zero timeouts.

---

## Complete Example

**File**: [`references/complete-example.md`](references/complete-example.md)

**Real-world case study**: Post-migration field synchronization

**Scale**:
- 2,500,000 records across 10 tables
- Duration: 3 nights (72 hours calendar, 9.5 hours active)
- Batch size: 50,000 records
- Frequency: Every 30 minutes (nights only)

**Results**:
- Zero timeouts
- Zero manual intervention
- Full progress visibility
- Accurate time estimates (±15 minutes)
- Complete automation via Job Queue

**Lessons learned**:
- SetLoadFields: 40% time saving
- Modify(false): 30% time saving
- Filter unprocessed: 60% time saving
- Batch limiting: Prevented timeout
- Night-only schedule: No business impact

---

## Decision Tree: Which Pattern to Use?

### Step 1: Will it timeout?

```
Records to process < 100,000? → No batch limiting needed (simple report)
Records > 100,000? → Use Pattern 1 (Batch-Limited Report)
```

### Step 2: Do users need visibility?

```
Yes, multi-day operation → Add Pattern 2 + 3 (Progress Tracking)
No, quick one-time fix → Pattern 1 only
```

### Step 3: Manual or automated?

```
Manual re-runs acceptable → Pattern 1 + 2
Fully automated needed → Add Pattern 4 (Job Queue)
```

### Step 4: Do users need monitoring?

```
Yes, want to see progress → Add Pattern 5 (Monitoring Pages)
No, just run and notify when done → Skip Pattern 5
```

### Example Scenarios

**Scenario A: Quick data fix (50K records)**
- Pattern: None (simple report)
- Time: 5 minutes
- Implementation: Standard report, no batch limiting

**Scenario B: Medium migration (500K records)**
- Patterns: 1 (Batch Limiting)
- Time: ~2 hours (10 batches × 12 min)
- Implementation: Batch report, manual re-runs

**Scenario C: Large migration (2.5M records, 3 days)**
- Patterns: 1 + 2 + 3 + 4 + 5 (Full stack)
- Time: 72 hours (automated nights)
- Implementation: Complete batch processing system

---

## Best Practices

### 1. Batch Size Selection

| Operation Type | Batch Size | Rationale |
|----------------|------------|-----------|
| Simple field copy | 50K-100K | Minimal processing |
| Calculations | 10K-25K | Some CPU per record |
| Lookups/joins | 5K-10K | Additional DB queries |
| Complex validation | 1K-5K | Multiple checks |
| Posting | 100-1K | Heavy transactional overhead |

**Test approach**:
1. Start with 10,000
2. Measure time per batch
3. Target: 5-15 minutes per batch
4. Adjust up/down accordingly

### 2. Performance Optimizations

```al
// ✅ DO: Load only needed fields
Rec.SetLoadFields("Field1", "Field2");

// ✅ DO: Skip validation on bulk updates
Rec.Modify(false);

// ✅ DO: Filter unprocessed first
Rec.SetRange("Status", '');

// ✅ DO: Update UI periodically
if GuiAllowed and (Counter mod 100 = 0) then
    Window.Update(1, Counter);

// ❌ DON'T: Load all fields
// ❌ DON'T: Update UI every record
// ❌ DON'T: Filter in AL code (use SQL filters)
```

### 3. Job Queue Timing

- **Start after hours** (22:00) to avoid user impact
- **Run every 30-60 min** to balance progress vs load
- **Set Max Attempts = 100+** for multi-day operations
- **Monitor first run manually** to validate batch size

### 4. Progress Table Management

```al
// Initialize ONCE
if Progress.FindFirst() then
    exit;  // Already initialized

// Count only UNPROCESSED
MyTable.SetRange("Status", '');
Progress.Initialize(Database::"MyTable", 'MyTable', MyTable.Count());
```

### 5. Post-Completion Cleanup

```al
// Stop Job Queue
Set Status = "On Hold"

// Optional: Delete tracking data
DELETE FROM "Batch Sync Progress";
DELETE FROM "Batch Sync Execution Log";

// Or: Drop tables (publish new version without them)
```

---

## Testing Strategy

### 1. Development Testing (Small Dataset)

```
1. Create 500 test records
2. Set BatchSize := 100
3. Run manually 5 times
4. Verify:
   - 100 records/run
   - BatchLimitReached toggles correctly
   - Progress updates accurately
```

### 2. Job Queue Simulation

```
1. Create 200 test records
2. BatchSize := 50
3. Configure Job Queue (5-min interval)
4. Monitor execution log
5. Verify 4 runs complete automatically
```

### 3. Production-Scale Timing

```sql
-- Create 100K test records
INSERT INTO "Test Table" ...

-- Measure: 10 batches of 10K records
-- Target: 5-15 min per batch
-- Adjust BatchSize if outside range
```

### 4. Monitoring Production

```sql
-- Progress overview
SELECT "Table Name", "Progress %", "Estimated Completion Time"
FROM "Batch Sync Progress"
ORDER BY "Progress %" ASC;

-- Execution history
SELECT TOP 10 "Entry No.", "Total Processed", "Duration (Minutes)"
FROM "Batch Sync Execution Log"
ORDER BY "Entry No." DESC;

-- Average speed
SELECT AVG("Total Processed" / NULLIF("Duration (Minutes)", 0))
FROM "Batch Sync Execution Log";
```

---

## Troubleshooting

### Issue 1: Report Times Out

**Symptoms**: Error after 12+ hours

**Causes**:
- Batch size too large
- No batch limiting implemented
- Processing all records (not filtering unprocessed)

**Solutions**:
- Reduce batch size (50K → 25K → 10K)
- Add batch limit check
- Filter before FindSet: `SetRange("Status", '')`

### Issue 2: Job Queue Stops After One Run

**Symptoms**: Only one execution logged

**Causes**:
- Max Attempts = 1 (default)
- Unprotected Confirm/Message blocking execution
- Error() call on batch limit

**Solutions**:
- Set Max Attempts = 100+
- Wrap UI calls in `if GuiAllowed`
- Exit cleanly, don't Error()

### Issue 3: Slow Progress

**Symptoms**: Taking weeks to complete

**Causes**:
- Batch size too small
- Not using SetLoadFields
- Using Modify(true) with validation
- Updating UI every record

**Solutions**:
- Increase batch size (10K → 25K → 50K)
- Add SetLoadFields
- Use Modify(false)
- Update UI every 100 records

### Issue 4: No Progress Visibility

**Symptoms**: Users complaining "no idea when it will finish"

**Solution**: Add Pattern 2 + 5 (Progress Tables + Pages)

### Issue 5: Reprocessing Same Records

**Symptoms**: Progress doesn't advance

**Cause**: No filter on status field

**Solution**:
```al
// Before FindSet:
MyTable.SetRange("Status Field", '');
```

---

## Key Takeaways

1. **Batch limiting prevents timeouts** - 10K-100K records per execution
2. **Progress tracking provides visibility** - Users see % and ETA
3. **Job Queue enables automation** - No manual re-runs needed
4. **GuiAllowed protection enables silent execution** - Works manual + automated
5. **Performance patterns essential** - SetLoadFields, Modify(false), filter first
6. **Clean up after** - Delete tracking tables post-migration

---

## References

### Internal References
- [`references/pattern-1-batch-limiting.md`](references/pattern-1-batch-limiting.md) - Detailed batch report pattern
- [`references/pattern-2-progress-tables.md`](references/pattern-2-progress-tables.md) - Progress tracking schemas
- [`references/pattern-4-job-queue.md`](references/pattern-4-job-queue.md) - Job Queue configuration
- [`references/anti-patterns.md`](references/anti-patterns.md) - Common mistakes
- [`references/complete-example.md`](references/complete-example.md) - Real-world case study

### External References
- [AL Performance Guidelines](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/performance/performance-developer)
- [Job Queue Management](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-job-queues-schedule-tasks)
- [Report Development](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-reports)

### Related Skills
- skill-performance (SetLoadFields, CalcSums patterns)
- skill-testing (Test strategy, Given/When/Then)

---

## License & Contribution

- **License**: MIT
- **Author**: Alex Polo - WAU Technologies (production implementation for customer project)
- **Contributions**: Welcome via AL Copilot Skills Collection repository
- **Version**: 1.0.0 (2026-05-26)

See [`AUTHORS.md`](AUTHORS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.


Process records in batches (e.g., 50,000 per execution) to avoid timeouts. Use a flag to signal incomplete batches.

```al
report 50000 "Batch Update Process"
{
    ProcessingOnly = true;
    UsageCategory = Administration;
    ApplicationArea = All;

    trigger OnPreReport()
    begin
        StartTime := CurrentDateTime;
        BatchSize := 50000;  // Tune based on complexity (10K-100K)
        TotalProcessed := 0;
        BatchLimitReached := false;

        if GuiAllowed then
            Window.Open('Processing...\' +
                       'Table: #1####################\' +
                       'Records: #2######');
    end;

    trigger OnPostReport()
    var
        Minutes, Seconds: Integer;
    begin
        if GuiAllowed then begin
            ElapsedTime := CurrentDateTime - StartTime;
            Minutes := ElapsedTime div 60000;
            Seconds := (ElapsedTime mod 60000) div 1000;

            Window.Close();
            if BatchLimitReached then
                Message('⚠️ BATCH COMPLETED - RUN AGAIN TO CONTINUE\\' +
                       'Processed: %1\\Time: %2m %3s\\' +
                       'IMPORTANT: Re-run until no records processed.',
                       TotalProcessed, Minutes, Seconds)
            else
                Message('✅ ALL RECORDS PROCESSED\\Total: %1\\Time: %2m %3s',
                       TotalProcessed, Minutes, Seconds);
        end;
    end;

    var
        Window: Dialog;
        StartTime: DateTime;
        ElapsedTime: Duration;
        BatchSize: Integer;
        TotalProcessed: Integer;
        BatchLimitReached: Boolean;

    local procedure ProcessTable1()
    var
        MyTable: Record "My Table";
    begin
        // Performance: Load only needed fields
        MyTable.SetLoadFields("No.", "Field to Update", "Status Field");
        
        // Efficiency: Filter to unprocessed records only
        MyTable.SetRange("Status Field", '');  // or SetFilter("Updated", 'false')

        if GuiAllowed then
            Window.Update(1, 'My Table');

        if MyTable.FindSet(true) then
            repeat
                // Update logic
                MyTable."Field to Update" := CalculateSomething(MyTable);
                MyTable."Status Field" := 'PROCESSED';
                MyTable.Modify(false);  // false = skip validation for speed
                
                TotalProcessed += 1;

                // Update UI every 100 records
                if GuiAllowed and (TotalProcessed mod 100 = 0) then
                    Window.Update(2, TotalProcessed);

                // Check batch limit
                if TotalProcessed >= BatchSize then begin
                    BatchLimitReached := true;
                    exit;  // Stop and allow Job Queue to re-run
                end;
            until MyTable.Next() = 0;
    end;
}
```

**Key principles:**
- **Batch size**: 10,000-100,000 depending on complexity (simple field copy = higher, calculations = lower)
- **Exit early**: Stop when batch limit reached, don't process all tables if first one hits limit
- **Filter unprocessed**: Use `SetRange` on a status field to avoid reprocessing
- **Performance**: `SetLoadFields()` + `Modify(false)` for speed

---

### Pattern 2: Progress Tracking Tables

Create dedicated tracking tables for multi-table batch operations.

#### Progress Table (per-table tracking)

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
        "Remaining Records" := "Total Records" - "Processed Records";

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

#### Execution Log Table (historical tracking)

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
        
        // Per-table counters (add fields for each table you process)
        field(30; "Table1 Count"; Integer) { }
        field(31; "Table2 Count"; Integer) { }
        // ... add more as needed
        
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
        Count2: Integer)
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
        
        "User ID" := CopyStr(UserId(), 1, 50);
        "Executed From Job Queue" := not GuiAllowed;
        
        Insert(true);
    end;
}
```

---

### Pattern 3: Report Integration with Progress Tracking

Integrate the batch report with tracking tables.

```al
report 50000 "Batch Update Process"
{
    // ... (declarations from Pattern 1)

    Permissions = tabledata "Batch Sync Progress" = RIMD,
                  tabledata "Batch Sync Execution Log" = RIMD;

    trigger OnPreReport()
    begin
        StartTime := CurrentDateTime;
        BatchSize := 50000;
        TotalProcessed := 0;
        BatchLimitReached := false;

        if GuiAllowed then
            Window.Open('Processing...\' +
                       'Table: #1####################\' +
                       'Records: #2######');

        // Initialize progress tracking (only first time)
        InitializeProgressTracking();
        
        // Process tables
        ProcessTable1();
        ProcessTable2();
        // ... more tables
    end;

    trigger OnPostReport()
    var
        ExecutionLog: Record "Batch Sync Execution Log";
    begin
        // Log this execution
        ExecutionLog.LogExecution(
            StartTime, CurrentDateTime, TotalProcessed, BatchLimitReached,
            CountTable1, CountTable2);

        // Show message to user (if not Job Queue)
        if GuiAllowed then begin
            // ... (message logic from Pattern 1)
        end;
    end;

    var
        CountTable1, CountTable2: Integer;

    local procedure InitializeProgressTracking()
    var
        Progress: Record "Batch Sync Progress";
        Table1: Record "My Table 1";
        Table2: Record "My Table 2";
    begin
        // Only initialize if no progress exists
        if Progress.FindFirst() then
            exit;

        // Table 1
        if not Progress.Get(Database::"My Table 1") then begin
            Table1.SetRange("Status Field", '');  // Count unprocessed only
            Progress.Initialize(Database::"My Table 1", 'My Table 1', Table1.Count());
            Progress.Insert(true);
        end;

        // Table 2
        if not Progress.Get(Database::"My Table 2") then begin
            Table2.SetRange("Status Field", '');
            Progress.Initialize(Database::"My Table 2", 'My Table 2', Table2.Count());
            Progress.Insert(true);
        end;
    end;

    local procedure ProcessTable1()
    var
        MyTable: Record "My Table 1";
    begin
        MyTable.SetLoadFields("No.", "Field to Update", "Status Field");
        MyTable.SetRange("Status Field", '');

        if GuiAllowed then
            Window.Update(1, 'My Table 1');

        if MyTable.FindSet(true) then
            repeat
                // Update logic
                MyTable."Field to Update" := CalculateSomething(MyTable);
                MyTable."Status Field" := 'PROCESSED';
                MyTable.Modify(false);
                CountTable1 += 1;
                TotalProcessed += 1;

                if GuiAllowed and (TotalProcessed mod 100 = 0) then
                    Window.Update(2, TotalProcessed);

                if TotalProcessed >= BatchSize then begin
                    BatchLimitReached := true;
                    UpdateProgress(Database::"My Table 1", CountTable1);
                    exit;
                end;
            until MyTable.Next() = 0;

        UpdateProgress(Database::"My Table 1", CountTable1);
    end;

    local procedure UpdateProgress(TableID: Integer; RecordsProcessed: Integer)
    var
        Progress: Record "Batch Sync Progress";
    begin
        if RecordsProcessed = 0 then
            exit;

        if Progress.Get(TableID) then
            Progress.IncrementProcessed(RecordsProcessed);
    end;
}
```

---

### Pattern 4: Job Queue Integration

Make the report executable automatically via Job Queue for unattended processing.

#### Key Requirements:

1. **GuiAllowed protection** - All user messages wrapped:
```al
if GuiAllowed then
    Message('...');  // Only show if manual execution
```

2. **Silent execution** - No prompts or confirmations:
```al
trigger OnInitReport()
begin
    // Only confirm if manual (GUI) execution
    if GuiAllowed then
        if not Confirm('Run this process?', false) then
            Error('Cancelled');
end;
```

3. **Auto-resume on batch limit** - Exit cleanly, Job Queue will re-run in 30 minutes

#### Job Queue Entry Setup:

```
Object Type to Run: Report
Object ID to Run: 50000
Report Request Page Options: (leave default or set filters)

Recurring Job: Yes
No. of Minutes between Runs: 30
Maximum No. of Attempts to Run: 100  (will auto-stop when BatchLimitReached = false)

Run on Mondays: Yes
Run on Tuesdays: Yes
... (all days: Yes)
Starting Time: 22:00:00  (start at night when users offline)
Ending Time: 08:00:00    (stop before business hours)
```

**How it works:**
1. Job Queue runs report at 22:00
2. Processes 50,000 records → BatchLimitReached = true → exits
3. Waits 30 minutes
4. Job Queue reruns at 22:30
5. Processes next 50,000 records
6. Repeats until BatchLimitReached = false (all records done)
7. Subsequent runs process 0 records and exit immediately

---

### Pattern 5: Progress Monitoring Pages

Create user-facing pages to view progress in real-time.

#### Main Progress List Page

```al
page 50100 "Batch Sync Progress List"
{
    Caption = 'Batch Sync Progress';
    PageType = List;
    SourceTable = "Batch Sync Progress";
    UsageCategory = Lists;
    ApplicationArea = All;
    Editable = false;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                field("Table Name"; Rec."Table Name")
                {
                    ApplicationArea = All;
                }
                field("Progress %"; Rec."Progress %")
                {
                    ApplicationArea = All;
                    StyleExpr = ProgressStyle;
                }
                field("Processed Records"; Rec."Processed Records")
                {
                    ApplicationArea = All;
                }
                field("Remaining Records"; Rec."Remaining Records")
                {
                    ApplicationArea = All;
                }
                field(Status; Rec.Status)
                {
                    ApplicationArea = All;
                    StyleExpr = StatusStyle;
                }
                field("Estimated Completion Time"; Rec."Estimated Completion Time")
                {
                    ApplicationArea = All;
                    Visible = Rec."Estimated Completion Time" <> 0DT;
                }
            }
        }
        area(FactBoxes)
        {
            part(ExecutionHistory; "Batch Sync Exec Log Part")
            {
                ApplicationArea = All;
                Caption = 'Recent Executions';
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(Refresh)
            {
                ApplicationArea = All;
                Caption = 'Refresh';
                Image = Refresh;
                Promoted = true;
                PromotedCategory = Process;

                trigger OnAction()
                begin
                    CurrPage.Update(false);
                end;
            }
            action(RunBatchReport)
            {
                ApplicationArea = All;
                Caption = 'Run Batch Report';
                Image = Start;
                Promoted = true;
                PromotedCategory = Process;

                trigger OnAction()
                begin
                    Report.Run(Report::"Batch Update Process");
                end;
            }
        }
    }

    trigger OnAfterGetRecord()
    begin
        SetStyles();
    end;

    local procedure SetStyles()
    begin
        // Color code progress
        case true of
            Rec."Progress %" >= 100:
                ProgressStyle := 'Favorable';  // Green
            Rec."Progress %" >= 50:
                ProgressStyle := 'Ambiguous';   // Yellow
            else
                ProgressStyle := 'Unfavorable'; // Red
        end;

        // Color code status
        case Rec.Status of
            Rec.Status::Completed:
                StatusStyle := 'Favorable';
            Rec.Status::"In Progress":
                StatusStyle := 'Ambiguous';
            else
                StatusStyle := 'Subordinate';
        end;
    end;

    var
        ProgressStyle, StatusStyle: Text;
}
```

#### Execution Log List Page

```al
page 50101 "Batch Sync Execution Log List"
{
    Caption = 'Batch Sync Execution History';
    PageType = List;
    SourceTable = "Batch Sync Execution Log";
    UsageCategory = Lists;
    ApplicationArea = All;
    Editable = false;
    SourceTableView = sorting("Entry No.") order(descending);

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                field("Entry No."; Rec."Entry No.")
                {
                    ApplicationArea = All;
                }
                field("Execution Started At"; Rec."Execution Started At")
                {
                    ApplicationArea = All;
                }
                field("Duration (Minutes)"; Rec."Duration (Minutes)")
                {
                    ApplicationArea = All;
                }
                field("Total Processed"; Rec."Total Processed")
                {
                    ApplicationArea = All;
                    StyleExpr = TotalStyle;
                }
                field("Batch Limit Reached"; Rec."Batch Limit Reached")
                {
                    ApplicationArea = All;
                }
                field("Executed From Job Queue"; Rec."Executed From Job Queue")
                {
                    ApplicationArea = All;
                }
            }
        }
    }

    trigger OnAfterGetRecord()
    begin
        if Rec."Total Processed" >= 50000 then
            TotalStyle := 'Favorable'
        else if Rec."Total Processed" > 0 then
            TotalStyle := 'Ambiguous'
        else
            TotalStyle := 'Subordinate';
    end;

    var
        TotalStyle: Text;
}
```

---

## Best Practices

### 1. **Choose the Right Batch Size**

- **Simple field copy**: 50,000-100,000 records
- **Calculations/validations**: 10,000-25,000 records
- **Complex logic (lookups, posting)**: 1,000-5,000 records
- **Test with production data volume** to find sweet spot

### 2. **Performance Optimizations**

```al
// ✅ DO: Load only needed fields
Record.SetLoadFields("Field1", "Field2");

// ✅ DO: Skip validation on mass updates
Record.Modify(false);

// ✅ DO: Filter to unprocessed records only
Record.SetRange("Processed", false);
Record.SetRange("Status", '');

// ✅ DO: Update UI periodically (every 100 records)
if GuiAllowed and (Counter mod 100 = 0) then
    Window.Update(1, Counter);

// ❌ DON'T: Update UI every record (slow)
if GuiAllowed then
    Window.Update(1, Counter);  // Called 50K times!
```

### 3. **Job Queue Timing**

- **Start after business hours** (e.g., 22:00) to avoid user impact
- **Run every 30-60 minutes** to balance progress vs. system load
- **Set Maximum Attempts = 100+** for multi-day operations
- **Monitor first execution manually** to validate batch size

### 4. **Progress Table Management**

```al
// Initialize ONCE at first execution
if Progress.FindFirst() then
    exit;  // Already initialized, don't recount

// Count only UNPROCESSED records
MyTable.SetRange("Status", '');  // Filter before Count()
Progress.Initialize(Database::"MyTable", 'MyTable', MyTable.Count());
```

### 5. **Post-Migration Cleanup**

After batch processing completes, clean up tracking objects:

```al
// Option A: Manual cleanup
DELETE FROM "Batch Sync Progress";
DELETE FROM "Batch Sync Execution Log";

// Option B: Drop tables (requires app update)
// 1. Remove table objects from AL project
// 2. Remove pages
// 3. Publish new version
```

---

## Anti-Patterns (Avoid These)

### ❌ **Anti-Pattern 1: Processing All Records Every Time**

```al
// WRONG: No filter on processed records
if MyTable.FindSet(true) then
    repeat
        if MyTable."Status" <> 'PROCESSED' then begin  // Checked 2.5M times!
            MyTable."Status" := 'PROCESSED';
            MyTable.Modify();
        end;
    until MyTable.Next() = 0;

// CORRECT: Filter first
MyTable.SetFilter("Status", '<>%1', 'PROCESSED');
if MyTable.FindSet(true) then
    repeat
        MyTable."Status" := 'PROCESSED';
        MyTable.Modify(false);
    until MyTable.Next() = 0;
```

### ❌ **Anti-Pattern 2: No Batch Limit**

```al
// WRONG: Processes all 2.5M records in one go (timeout after 12 hours)
if MyTable.FindSet(true) then
    repeat
        MyTable.UpdateField();
        MyTable.Modify();
    until MyTable.Next() = 0;

// CORRECT: Stop at batch limit
if MyTable.FindSet(true) then
    repeat
        MyTable.UpdateField();
        MyTable.Modify(false);
        Counter += 1;
        
        if Counter >= BatchSize then
            exit;  // Stop and let Job Queue re-run
    until MyTable.Next() = 0;
```

### ❌ **Anti-Pattern 3: Blocking Job Queue Execution**

```al
// WRONG: Confirm dialog blocks Job Queue
trigger OnInitReport()
begin
    if not Confirm('Run this?', false) then  // Job Queue can't answer!
        Error('Cancelled');
end;

// CORRECT: Only confirm if GUI
trigger OnInitReport()
begin
    if GuiAllowed then  // Only when user runs manually
        if not Confirm('Run this?', false) then
            Error('Cancelled');
end;
```

### ❌ **Anti-Pattern 4: Recounting Total Every Execution**

```al
// WRONG: Counts 2.5M records every 30 minutes
procedure InitializeProgress()
begin
    MyTable.SetRange("Status", '');
    Progress."Total Records" := MyTable.Count();  // Slow COUNT(*) query
    Progress.Insert(true);
end;

// CORRECT: Count only ONCE (first execution)
procedure InitializeProgress()
begin
    if Progress.FindFirst() then
        exit;  // Already initialized
    
    MyTable.SetRange("Status", '');
    Progress."Total Records" := MyTable.Count();
    Progress.Insert(true);
end;
```

---

## Testing Strategy

### 1. **Development Testing (Small Dataset)**

```al
// Test with 500 records, BatchSize = 100
1. Create test data (500 records)
2. Set BatchSize := 100 in report
3. Run manually (GuiAllowed = true)
4. Verify:
   - 100 records processed
   - BatchLimitReached = true
   - Progress table updated correctly
5. Run again 4 more times
6. Verify all 500 processed, BatchLimitReached = false
```

### 2. **Job Queue Simulation**

```al
// Test Job Queue behavior in dev
1. Set up Job Queue entry (Recurring = Yes, 5-minute interval)
2. Set BatchSize := 50 (small for fast testing)
3. Create 200 test records
4. Start Job Queue
5. Monitor "Batch Sync Execution Log" page
6. Verify 4 executions logged (50 records each)
```

### 3. **Performance Testing (Production-Like Volume)**

```sql
-- Create 100K test records
INSERT INTO "My Table" ("No.", "Status", ...)
SELECT 'TEST' + CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR), '', ...
FROM master..spt_values a, master..spt_values b;  -- Creates 100K+ rows

-- Test with BatchSize = 10,000
-- Measure: Time per batch, records per second
-- Adjust BatchSize if too slow or too fast
```

### 4. **Monitoring Production Execution**

```sql
-- Query progress
SELECT "Table Name", "Progress %", "Estimated Completion Time"
FROM "Batch Sync Progress"
ORDER BY "Progress %" ASC;

-- Query execution history
SELECT TOP 10 "Entry No.", "Execution Started At", "Duration (Minutes)", "Total Processed"
FROM "Batch Sync Execution Log"
ORDER BY "Entry No." DESC;

-- Calculate average speed
SELECT AVG("Total Processed" / NULLIF("Duration (Minutes)", 0)) AS "Avg Records Per Minute"
FROM "Batch Sync Execution Log"
WHERE "Duration (Minutes)" > 0;
```

---

## Complete Example: Post-Migration Field Sync

**Scenario:** After data migration, 2.5M records across 10 tables need field synchronization. Process will take 3-4 days running every 30 minutes.

**Implementation:**

1. ✅ Create `IndSyncProgress` table (Pattern 2)
2. ✅ Create `IndSyncExecutionLog` table (Pattern 2)
3. ✅ Create batch report with 50,000 limit (Pattern 1 + 3)
4. ✅ Wrap all messages in `if GuiAllowed` (Pattern 4)
5. ✅ Create progress monitoring pages (Pattern 5)
6. ✅ Set up Job Queue (every 30 min, max 100 attempts)
7. ✅ Test with 1,000 records in dev
8. ✅ Deploy to production
9. ✅ Monitor via "Batch Sync Progress List" page
10. ✅ After completion: Delete tracking tables

**Results:**
- ✅ 2.5M records processed over 3 nights
- ✅ No timeouts (batch size = 50,000)
- ✅ Real-time progress visibility
- ✅ Accurate time estimates (ETA shown to users)
- ✅ Complete execution history for audit
- ✅ Zero manual intervention (Job Queue automation)

---

## Key Takeaways

1. **Batch limiting prevents timeouts** - Process 10K-100K records per execution
2. **Progress tracking provides visibility** - Users see % complete and ETA
3. **Job Queue enables automation** - No manual reruns needed
4. **GuiAllowed protection enables silent execution** - Works both manual and automated
5. **Performance patterns essential** - SetLoadFields, Modify(false), filter before find
6. **Clean up after** - Delete tracking tables post-migration

---

## References

- [AL Performance Guidelines](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/performance/performance-developer)
- [Job Queue Management](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-job-queues-schedule-tasks)
- [Report Development](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-reports)
- skill-performance (SetLoadFields, CalcSums patterns)

---

## License & Contribution

This skill is part of the AL Copilot Skills Collection.
- **License**: MIT
- **Author**: Developed from production implementation (WAU Technologies customer project)
- **Contributions**: Welcome via pull request to AL Copilot Skills Collection repository
