# Pattern 1: Batch-Limited Report with Auto-Resume

## Problem

Processing millions of records in a single execution causes timeout errors after 12+ hours. Reports fail, data is left in inconsistent state, users have no visibility into progress.

## Solution

Process records in batches (e.g., 50,000 per execution) with automatic resumption. Use a flag to signal incomplete batches, allowing Job Queue to re-run automatically.

## Implementation

### Report Structure

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

## Key Principles

### 1. Batch Size Selection

Choose based on operation complexity:

| Operation Type | Recommended Batch Size | Rationale |
|----------------|----------------------|-----------|
| Simple field copy | 50,000 - 100,000 | Minimal processing per record |
| Field calculations | 10,000 - 25,000 | Some CPU per record |
| Lookups/joins | 5,000 - 10,000 | Additional DB queries |
| Complex validation | 1,000 - 5,000 | Multiple checks per record |
| Posting operations | 100 - 1,000 | Heavy transactional overhead |

**Testing approach:**
1. Start with 10,000 records
2. Measure duration per 1,000 records
3. Extrapolate to 50,000
4. If under 10 minutes → increase batch size
5. If over 15 minutes → decrease batch size

### 2. Exit Early Strategy

```al
// ✅ Correct: Exit as soon as batch limit reached
if TotalProcessed >= BatchSize then begin
    BatchLimitReached := true;
    exit;  // Don't process more tables
end;

// ❌ Wrong: Process all tables even after limit
if TotalProcessed >= BatchSize then
    BatchLimitReached := true;
// Continues processing other tables!
```

### 3. Filter Unprocessed Records

```al
// ✅ Option A: Status field
MyTable.SetRange("Status Field", '');

// ✅ Option B: Boolean flag
MyTable.SetRange("Processed", false);

// ✅ Option C: Empty indicator field
MyTable.SetFilter("Updated At", '0DT');

// ❌ Wrong: Load all, filter in code
if MyTable.FindSet(true) then
    repeat
        if MyTable."Status Field" = '' then  // Checked 2.5M times!
            // process
    until MyTable.Next() = 0;
```

### 4. Performance Optimizations

```al
// ✅ Load only needed fields
MyTable.SetLoadFields("No.", "Field1", "Field2", "Status Field");

// ✅ Skip validation on bulk updates
MyTable.Modify(false);

// ✅ Update UI periodically (every 100 records)
if GuiAllowed and (Counter mod 100 = 0) then
    Window.Update(1, Counter);

// ❌ Don't: Update UI every record
Window.Update(1, Counter);  // Called 50,000 times = slow
```

## Workflow

1. **First execution**:
   - Processes first 50,000 records
   - Sets `BatchLimitReached = true`
   - Exits (remaining: 2,450,000 records)

2. **Second execution** (30 minutes later via Job Queue):
   - Processes next 50,000 records
   - Sets `BatchLimitReached = true`
   - Exits (remaining: 2,400,000 records)

3. **...continues automatically...**

4. **Final execution**:
   - Processes remaining 15,000 records
   - Sets `BatchLimitReached = false`
   - Message: "✅ ALL RECORDS PROCESSED"
   - Subsequent runs process 0 records → exit immediately

## Testing

### Test 1: Manual Execution (Development)

```al
// Create 500 test records
BatchSize := 100;  // Small for quick testing

Run report manually
→ Expect: 100 processed, BatchLimitReached = true
→ Run again: 100 processed
→ Run again: 100 processed
→ Run again: 100 processed
→ Run again: 100 processed
→ Run final: 0 processed, BatchLimitReached = false
```

### Test 2: Job Queue Simulation

1. Create 200 test records
2. Set BatchSize := 50
3. Configure Job Queue (5-minute interval)
4. Start Job Queue
5. Monitor executions (should see 4 runs)
6. Verify all 200 records processed

### Test 3: Production-Scale Timing

```sql
-- Create 100K test records
BatchSize := 10000;

-- Measure execution time
-- Target: 5-15 minutes per batch
-- Adjust BatchSize if outside range
```

## Common Issues

### Issue 1: All Records Reprocessed Every Time

**Symptom**: Report always processes same records

**Cause**: No filter on status field

**Fix**:
```al
// Add before FindSet
MyTable.SetRange("Status Field", '');
```

### Issue 2: Job Queue Doesn't Re-Run

**Symptom**: Only one execution, then stops

**Cause**: Maximum attempts = 1 (default)

**Fix**: Set "Maximum No. of Attempts to Run" = 100+

### Issue 3: Batch Takes Too Long (Timeout)

**Symptom**: Report times out before BatchSize reached

**Cause**: BatchSize too large for operation complexity

**Fix**: Reduce BatchSize from 50,000 → 25,000 → 10,000 until under 15 min

## Best Practices

1. **Always filter unprocessed first** - Don't rely on IF checks in loop
2. **Exit immediately on batch limit** - Don't continue to other tables
3. **Use SetLoadFields** - Load only fields you need
4. **Modify(false) for speed** - Skip validation in bulk operations
5. **Update UI sparingly** - Every 100 records, not every record
6. **Test with production volume** - Dev data doesn't reveal timeout issues

## Related Patterns

- Pattern 2: Progress Tracking Tables (track per-table completion)
- Pattern 3: Report Integration (combine batch limiting with progress tracking)
- Pattern 4: Job Queue Integration (automate the re-runs)
