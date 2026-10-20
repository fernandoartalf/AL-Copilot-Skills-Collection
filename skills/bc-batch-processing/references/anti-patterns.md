# Anti-Patterns: Common Mistakes to Avoid

## Anti-Pattern 1: Processing All Records Every Time

### The Mistake

```al
// ❌ WRONG: No filter on processed records
if MyTable.FindSet(true) then
    repeat
        if MyTable."Status" <> 'PROCESSED' then begin  // Checked 2.5M times!
            MyTable."Status" := 'PROCESSED';
            MyTable.Modify();
        end;
    until MyTable.Next() = 0;
```

### Why It's Bad

- Loads ALL 2.5M records into memory
- Evaluates IF condition 2.5M times
- Wastes time on already-processed records
- No benefit from batch limiting (reprocesses everything)

### The Fix

```al
// ✅ CORRECT: Filter before loading
MyTable.SetFilter("Status", '<>%1', 'PROCESSED');  // DB-level filter
if MyTable.FindSet(true) then
    repeat
        MyTable."Status" := 'PROCESSED';
        MyTable.Modify(false);
    until MyTable.Next() = 0;
```

### Impact

| Approach | Records Loaded | Time (50K records) |
|----------|----------------|-------------------|
| Wrong (no filter) | 2,500,000 | 45 minutes |
| Correct (filtered) | 50,000 | 12 minutes |

---

## Anti-Pattern 2: No Batch Limit

### The Mistake

```al
// ❌ WRONG: Processes all 2.5M records in one execution
if MyTable.FindSet(true) then
    repeat
        MyTable.UpdateField();
        MyTable.Modify();
    until MyTable.Next() = 0;

// Report runs for 12+ hours → timeout error
```

### Why It's Bad

- Timeout after 12 hours → all work lost
- No progress visibility
- Users can't plan (no ETA)
- Can't resume if interrupted

### The Fix

```al
// ✅ CORRECT: Stop at batch limit
Counter := 0;
BatchSize := 50000;

if MyTable.FindSet(true) then
    repeat
        MyTable.UpdateField();
        MyTable.Modify(false);
        Counter += 1;
        
        if Counter >= BatchSize then begin
            BatchLimitReached := true;
            exit;  // Stop processing, Job Queue will re-run
        end;
    until MyTable.Next() = 0;
```

### Impact

| Approach | Max Duration | Timeout Risk | Resumable |
|----------|--------------|--------------|-----------|
| No limit | 12+ hours | High | No |
| Batch limit (50K) | 15 minutes | None | Yes |

---

## Anti-Pattern 3: Blocking Job Queue Execution

### The Mistake

```al
// ❌ WRONG: Confirm dialog blocks Job Queue
trigger OnInitReport()
begin
    if not Confirm('Run this process?', false) then  // Job Queue can't answer!
        Error('Cancelled');
end;

// ❌ WRONG: Unprotected Message
trigger OnPostReport()
begin
    Message('Processing complete');  // Job Queue can't dismiss
end;
```

### Why It's Bad

- Job Queue execution hangs waiting for user input
- Status stuck on "In Process"
- Report never completes
- Requires manual intervention

### The Fix

```al
// ✅ CORRECT: GuiAllowed protection
trigger OnInitReport()
begin
    if GuiAllowed then  // Only when user runs manually
        if not Confirm('Run this process?', false) then
            Error('Cancelled');
    // Job Queue bypasses this check
end;

trigger OnPostReport()
begin
    if GuiAllowed then  // Only show message if manual run
        Message('Processing complete');
    // Job Queue: silent execution
end;
```

### Checklist: Job Queue Compatibility

- [ ] All `Message()` calls wrapped in `if GuiAllowed`
- [ ] All `Confirm()` calls wrapped in `if GuiAllowed`
- [ ] All `Dialog.Open()` calls wrapped in `if GuiAllowed`
- [ ] No `Error()` calls on normal batch limit
- [ ] Exit cleanly when `BatchLimitReached = true`

---

## Anti-Pattern 4: Recounting Total Every Execution

### The Mistake

```al
// ❌ WRONG: Counts 2.5M records every 30 minutes
procedure InitializeProgress()
var
    Progress: Record "Batch Sync Progress";
    MyTable: Record "My Table";
begin
    MyTable.SetRange("Status", '');
    Progress."Total Records" := MyTable.Count();  // Slow COUNT(*) query every run
    Progress.Insert(true);
end;
```

### Why It's Bad

- `COUNT(*)` on 2.5M records takes 30-60 seconds
- Repeated 50+ times over 3 days
- Wastes 25-50 minutes total
- Delays actual processing

### The Fix

```al
// ✅ CORRECT: Count only ONCE (first execution)
procedure InitializeProgress()
var
    Progress: Record "Batch Sync Progress";
    MyTable: Record "My Table";
begin
    // Exit if already initialized
    if Progress.FindFirst() then
        exit;
    
    // Count only on first run
    MyTable.SetRange("Status", '');
    Progress."Total Records" := MyTable.Count();
    Progress.Insert(true);
end;
```

### Impact

| Approach | Count Frequency | Wasted Time |
|----------|----------------|-------------|
| Every execution | 50 times | 25-50 minutes |
| Once only | 1 time | 30 seconds |

---

## Anti-Pattern 5: Loading All Fields

### The Mistake

```al
// ❌ WRONG: Loads all 50+ fields per record
if SalesLine.FindSet(true) then
    repeat
        SalesLine."Unit Price" := CalculatePrice();  // Only need this field
        SalesLine.Modify();
    until SalesLine.Next() = 0;
```

### Why It's Bad

- Transfers megabytes of unnecessary data from SQL
- Slower query execution
- Higher memory usage
- More network traffic

### The Fix

```al
// ✅ CORRECT: Load only needed fields
SalesLine.SetLoadFields("Document No.", "Line No.", "Unit Price");
if SalesLine.FindSet(true) then
    repeat
        SalesLine."Unit Price" := CalculatePrice();
        SalesLine.Modify(false);  // Also: skip validation for speed
    until SalesLine.Next() = 0;
```

### Impact

| Approach | Data Transferred (50K records) | Time |
|----------|-------------------------------|------|
| All fields (50 fields) | ~500 MB | 18 min |
| 3 fields only | ~30 MB | 12 min |

---

## Anti-Pattern 6: Updating UI Every Record

### The Mistake

```al
// ❌ WRONG: Updates dialog 50,000 times
if MyTable.FindSet(true) then
    repeat
        MyTable.Process();
        Counter += 1;
        Window.Update(1, Counter);  // Called 50,000 times
    until MyTable.Next() = 0;
```

### Why It's Bad

- UI updates are slow (50-100ms each)
- Adds 40-80 minutes to processing time
- No user value (can't read 50K updates)

### The Fix

```al
// ✅ CORRECT: Update every 100 records
if MyTable.FindSet(true) then
    repeat
        MyTable.Process();
        Counter += 1;
        
        if GuiAllowed and (Counter mod 100 = 0) then
            Window.Update(1, Counter);  // Called 500 times
    until MyTable.Next() = 0;
```

### Impact

| Update Frequency | UI Updates | Time Overhead |
|------------------|------------|---------------|
| Every record | 50,000 | 40-80 minutes |
| Every 100 records | 500 | 25-50 seconds |
| Every 1,000 records | 50 | 2-5 seconds |

---

## Anti-Pattern 7: No Error Handling

### The Mistake

```al
// ❌ WRONG: Unhandled errors stop entire process
if MyTable.FindSet(true) then
    repeat
        ProcessRecord(MyTable);  // May throw error
        MyTable.Modify();
    until MyTable.Next() = 0;
```

### Why It's Bad

- One bad record stops entire batch
- No visibility into which record failed
- Forces manual intervention
- Can't skip problematic records

### The Fix

```al
// ✅ CORRECT: Try-catch with error logging
if MyTable.FindSet(true) then
    repeat
        if not TryProcessRecord(MyTable) then begin
            LogError(MyTable."No.", GetLastErrorText());
            ErrorCount += 1;
        end else begin
            MyTable."Status" := 'PROCESSED';
            MyTable.Modify(false);
            SuccessCount += 1;
        end;
    until MyTable.Next() = 0;

[TryFunction]
local procedure TryProcessRecord(var Rec: Record "My Table"): Boolean
begin
    ProcessRecord(Rec);
    exit(true);
end;
```

### Benefits

- Continues processing on errors
- Logs problematic records for review
- Provides error statistics
- Allows partial completion

---

## Summary: Checklist for Avoiding Anti-Patterns

Before deploying your batch report:

**Filtering:**
- [ ] Filter unprocessed records BEFORE FindSet
- [ ] Use SetRange/SetFilter, not IF in loop

**Batch Limiting:**
- [ ] Implement batch size limit (10K-100K)
- [ ] Exit when limit reached
- [ ] Set BatchLimitReached flag

**Job Queue:**
- [ ] Wrap all UI interactions in `if GuiAllowed`
- [ ] No blocking Confirm/Message/Dialog
- [ ] Clean exit (no Error on batch limit)

**Performance:**
- [ ] Use SetLoadFields for minimal field loading
- [ ] Use Modify(false) to skip validation
- [ ] Update UI every 100+ records, not every record

**Progress Tracking:**
- [ ] Count totals only ONCE (first execution)
- [ ] Update progress after each table
- [ ] Log execution history

**Error Handling:**
- [ ] Wrap risky operations in [TryFunction]
- [ ] Log errors, don't stop batch
- [ ] Report error count at end

---

## Real-World Impact

**Before optimization** (all anti-patterns):
- Processing time: 18+ hours
- Timeout failures: Every run
- Manual intervention: Constant
- User visibility: None
- Error handling: Crash on first error

**After optimization** (patterns applied):
- Processing time: 12 minutes per batch
- Timeout failures: Zero
- Manual intervention: None (Job Queue)
- User visibility: Real-time progress + ETA
- Error handling: Logs errors, continues processing

**Result**: 2.5M records processed automatically over 3 nights with zero failures.
