# Pattern 4: Job Queue Integration

## Problem

Manual execution requires:
- User monitoring every 30 minutes
- Manual re-runs for days
- Risk of forgetting to re-run
- No execution during nights/weekends

## Solution

Configure Job Queue to automatically re-run the report every 30 minutes until `BatchLimitReached = false`.

## Prerequisites

### 1. GuiAllowed Protection

Wrap ALL user interactions:

```al
// ✅ Correct: Protected messages
if GuiAllowed then
    Message('Processing complete');

if GuiAllowed then
    Window.Open('Progress...');

// ❌ Wrong: Blocks Job Queue
Message('Processing complete');  // Job Queue can't dismiss
Confirm('Continue?', false);      // Job Queue can't answer
Error('Failed');                  // Stops Job Queue permanently
```

### 2. Silent Confirmation

```al
trigger OnInitReport()
begin
    // Only confirm if manual (GUI) execution
    if GuiAllowed then
        if not Confirm('Run this process?', false) then
            Error('Cancelled by user');
    // Job Queue bypasses this check
end;
```

### 3. Clean Exit on Batch Limit

```al
trigger OnPostReport()
begin
    // Don't Error() on batch limit — just log and exit
    if BatchLimitReached then begin
        // Log execution
        ExecutionLog.LogExecution(...);
        // Exit cleanly (Job Queue will re-run)
        exit;
    end;
end;
```

## Job Queue Entry Configuration

### Basic Setup

Navigate to: **Job Queue Entries** page

**Required fields:**

| Field | Value | Notes |
|-------|-------|-------|
| Object Type to Run | Report | |
| Object ID to Run | 50000 | Your batch report ID |
| Report Request Page Options | (default) | Can set filters if needed |
| Maximum No. of Attempts to Run | 100 | **CRITICAL**: Default is 1 |
| Recurring Job | Yes | Auto-restart after run |
| No. of Minutes between Runs | 30 | Balance: progress vs system load |

### Schedule

**Option A: 24/7 Processing**
```
Run on Mondays: Yes
Run on Tuesdays: Yes
Run on Wednesdays: Yes
Run on Thursdays: Yes
Run on Fridays: Yes
Run on Saturdays: Yes
Run on Sundays: Yes
Starting Time: 00:00:00
Ending Time: 23:59:59
```

**Option B: Nights Only** (recommended for production)
```
Starting Time: 22:00:00  (after business hours)
Ending Time: 08:00:00    (before users arrive)
All days: Yes
```

**Option C: Weekends Only** (minimal impact)
```
Run on Mondays: No
Run on Tuesdays: No
Run on Wednesdays: No
Run on Thursdays: No
Run on Fridays: No
Run on Saturdays: Yes
Run on Sundays: Yes
Starting Time: 00:00:00
Ending Time: 23:59:59
```

### Priority

```
Priority: 500  (default)
```

Lower number = higher priority. Set to 1000 if you want other jobs to run first.

## Execution Flow

### First Night (22:00 - 08:00)

```
22:00 → Execution 1: 50,000 processed, BatchLimit = true
22:30 → Execution 2: 50,000 processed, BatchLimit = true
23:00 → Execution 3: 50,000 processed, BatchLimit = true
23:30 → Execution 4: 50,000 processed, BatchLimit = true
00:00 → Execution 5: 50,000 processed, BatchLimit = true
...
07:30 → Execution 20: 50,000 processed, BatchLimit = true
08:00 → Stop (business hours)

Total: 1,000,000 records processed
Remaining: 1,500,000
```

### Second Night

```
22:00 → Execution 21: 50,000 processed, BatchLimit = true
...
07:30 → Execution 40: 50,000 processed, BatchLimit = true
08:00 → Stop

Total: 2,000,000 records processed
Remaining: 500,000
```

### Third Night

```
22:00 → Execution 41: 50,000 processed, BatchLimit = true
22:30 → Execution 42: 50,000 processed, BatchLimit = true
...
23:30 → Execution 45: 50,000 processed, BatchLimit = true
00:00 → Execution 46: 0 processed, BatchLimit = false ✅

Job Queue stops (all records processed)
```

## Monitoring

### View Job Queue Status

Navigate to: **Job Queue Entries** → Your entry

**Key fields to monitor:**

```
Status: Ready / In Process / Error
Last Ready State: [timestamp of last successful run]
Number of Attempts to Run: 45 (increments each run)
Earliest Start Date/Time: [next scheduled run]
```

### View Execution Log

Navigate to: **Batch Sync Execution Log List**

```sql
SELECT TOP 10 
    "Entry No.", 
    "Execution Started At", 
    "Duration (Minutes)", 
    "Total Processed",
    "Batch Limit Reached"
FROM "Batch Sync Execution Log"
ORDER BY "Entry No." DESC;
```

**Example output:**
```
Entry | Started At       | Duration | Total   | Batch Limit
------|------------------|----------|---------|------------
45    | 2026-05-29 00:00 | 12.3     | 0       | No  ✅
44    | 2026-05-28 23:30 | 13.1     | 50,000  | Yes
43    | 2026-05-28 23:00 | 12.8     | 50,000  | Yes
```

### View Progress

Navigate to: **Batch Sync Progress List**

```
Table Name              Progress %  Remaining   ETA
--------------------- ------------- ----------- ------------------
Sales Header               100%          0      Completed
Sales Line                 100%          0      Completed
Sales Shipment Line         89%      55,000     Thu 22:15
Sales Invoice Line          45%     275,000     Fri 01:30
```

## Troubleshooting

### Issue 1: Job Queue Stops After First Run

**Symptom**: Only one execution, then status = "On Hold"

**Cause**: "Maximum No. of Attempts to Run" = 1 (default)

**Fix**: 
1. Open Job Queue Entry
2. Set "Maximum No. of Attempts to Run" = 100
3. Set "Status" = "Ready"

### Issue 2: Job Queue Shows "Error"

**Symptom**: Status = "Error", Last Error: "..."

**Causes**:
- Unprotected Error() call in report
- Unprotected Message() or Confirm() call
- Actual runtime error (division by zero, record not found, etc.)

**Fix**:
1. Read error message in "Error Message" field
2. Fix the code issue
3. Set "Status" = "Ready" to restart

### Issue 3: Job Queue Runs During Business Hours

**Symptom**: Users report slowness during work hours

**Fix**:
1. Set "Starting Time" = 22:00:00
2. Set "Ending Time" = 08:00:00

### Issue 4: Job Queue Runs Too Frequently

**Symptom**: System overloaded, reports slow

**Fix**: Increase "No. of Minutes between Runs" from 30 → 60

### Issue 5: Job Queue Runs Too Infrequently

**Symptom**: Progress too slow, will take weeks

**Fix**: 
- **Option A**: Decrease interval from 30 → 15 minutes
- **Option B**: Increase batch size from 50,000 → 75,000
- **Option C**: Enable 24/7 execution

## Best Practices

### 1. Test First

Before enabling Job Queue:
1. Run report manually 3-5 times
2. Verify batch limiting works
3. Check progress updates correctly
4. Confirm execution log entries created

### 2. Start Conservatively

```
First deployment:
- Interval: 30 minutes (not 5)
- Schedule: Nights only (not 24/7)
- Batch size: 50,000 (not 100,000)

Monitor for 1-2 days, then adjust if needed
```

### 3. Monitor Actively (First Week)

Check daily:
- Number of executions completed
- Average duration per execution
- Any errors in Job Queue Log Entry
- Progress % advancement

### 4. Plan for Completion

Estimated completion time = (Remaining records) / (Records per hour) / (Hours per day)

Example:
```
Remaining: 2,500,000 records
Speed: 100,000 records/hour (2 executions/hour × 50K/exec)
Schedule: 10 hours/night (22:00 - 08:00)

Days needed: 2,500,000 / 100,000 / 10 = 2.5 nights
```

### 5. Clean Up After

When `BatchLimitReached = false` (all done):
1. Set Job Queue Entry Status = "On Hold" (stop future runs)
2. Optional: Delete Job Queue Entry
3. Optional: Delete progress tracking tables
4. Document completion date for audit

## Security Considerations

### Permissions Required

Job Queue Entry needs:
```al
Permissions = tabledata "My Table 1" = RIMD,
              tabledata "My Table 2" = RIMD,
              tabledata "Batch Sync Progress" = RIMD,
              tabledata "Batch Sync Execution Log" = RIMD;
```

### User Context

Job Queue runs as "NT AUTHORITY\SYSTEM" (service account).

Ensure:
- Report doesn't rely on UserId() for business logic
- No user-specific filters that break in Job Queue context
- Error messages don't expose sensitive data (logged to Job Queue Log)

## Related Patterns

- Pattern 1: Batch-Limited Report (what the Job Queue runs)
- Pattern 2: Progress Tracking Tables (what you monitor)
- Pattern 5: Progress Monitoring Pages (how you monitor)
