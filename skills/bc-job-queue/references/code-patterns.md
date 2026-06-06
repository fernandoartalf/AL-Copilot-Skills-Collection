# Job Queue Code Patterns

Use these snippets as templates. Verify signatures in the target runtime symbols before finalizing code.

## 1. Runnable codeunit with direct access to Job Queue Entry

Prefer this pattern when the job consumes `Parameter String` or `Record ID to Process`.

```al
codeunit 50100 "My Background Job"
{
    TableNo = "Job Queue Entry";

    trigger OnRun()
    var
        ProcessDate: Date;
    begin
        ProcessDate := ParseDateParameter(Rec."Parameter String");
        RunJob(ProcessDate, Rec."Record ID to Process");
    end;

    local procedure ParseDateParameter(JobParameter: Text[250]): Date
    var
        YearInt: Integer;
        MonthInt: Integer;
        DayInt: Integer;
    begin
        if StrLen(JobParameter) <> 8 then
            Error('Expected parameter format YYYYMMDD.');
        if not Evaluate(YearInt, CopyStr(JobParameter, 1, 4)) then
            Error('Invalid year in parameter.');
        if not Evaluate(MonthInt, CopyStr(JobParameter, 5, 2)) then
            Error('Invalid month in parameter.');
        if not Evaluate(DayInt, CopyStr(JobParameter, 7, 2)) then
            Error('Invalid day in parameter.');

        exit(DMY2Date(DayInt, MonthInt, YearInt));
    end;

    local procedure RunJob(ProcessDate: Date; RecordIdToProcess: RecordId)
    begin
        // Keep business logic free of UI assumptions and safe for retries.
    end;
}
```

## 2. Manual enqueue with explicit retry policy

Use when you need full control over the entry before enqueuing it.

```al
procedure EnqueueCleanup(ProcessDate: Date; EarliestStartDateTime: DateTime)
var
    JobQueueEntry: Record "Job Queue Entry";
begin
    Clear(JobQueueEntry);
    JobQueueEntry.Init();
    JobQueueEntry."Object Type to Run" := JobQueueEntry."Object Type to Run"::Codeunit;
    JobQueueEntry."Object ID to Run" := Codeunit::"My Background Job";
    JobQueueEntry.Description := CopyStr('Nightly cleanup', 1, MaxStrLen(JobQueueEntry.Description));
    JobQueueEntry."Earliest Start Date/Time" := EarliestStartDateTime;
    JobQueueEntry."Maximum No. of Attempts to Run" := 5;
    JobQueueEntry."Rerun Delay (sec.)" := 180;
    JobQueueEntry."Parameter String" := CopyStr(
        Format(ProcessDate, 0, '<year4><month,2><day,2>'),
        1,
        MaxStrLen(JobQueueEntry."Parameter String"));

    Codeunit.Run(Codeunit::"Job Queue - Enqueue", JobQueueEntry);
end;
```

## 3. Delayed scheduling with helper method on Job Queue Entry

Use when the runtime exposes helper methods and the schedule shape matches them.

```al
procedure ScheduleForLater(StartDate: Date; StartTime: Time)
var
    JobQueueEntry: Record "Job Queue Entry";
begin
    JobQueueEntry.ScheduleJobQueueEntryForLater(
        Codeunit::"My Background Job",
        CreateDateTime(StartDate, StartTime),
        'DEFAULT',
        'MODE=FULL');
end;
```

## 4. Recurrent scheduling with frequency

Use when the workload is truly periodic and admins should still manage it through Job Queue.

```al
procedure ScheduleRecurrentJob(TargetRecordId: RecordId)
var
    JobQueueEntry: Record "Job Queue Entry";
begin
    JobQueueEntry.ScheduleRecurrentJobQueueEntryWithFrequency(
        JobQueueEntry."Object Type to Run"::Codeunit,
        Codeunit::"My Background Job",
        TargetRecordId,
        60,
        030000T);
end;
```

## 5. Foreground execution for validation

Use when the user wants to test or debug a configured entry without waiting for the scheduled run.

```al
procedure RunOnceInForeground(JobQueueEntryId: Guid)
var
    JobQueueEntry: Record "Job Queue Entry";
    JobQueueManagement: Codeunit "Job Queue Management";
begin
    if not JobQueueEntry.Get(JobQueueEntryId) then
        exit;

    JobQueueManagement.RunJobQueueEntryOnce(JobQueueEntry);
end;
```

## 6. Restart a failed entry

Use only after checking whether the job is safe to rerun.

```al
procedure RestartEntry(JobQueueEntryId: Guid)
var
    JobQueueEntry: Record "Job Queue Entry";
begin
    if not JobQueueEntry.Get(JobQueueEntryId) then
        exit;

    JobQueueEntry.Restart();
end;
```

## 7. Enqueue extensibility hooks

Use these events when you need to normalize entries or capture metadata at enqueue time.

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Job Queue - Enqueue", 'OnBeforeEnqueueJobQueueEntry', '', false, false)]
local procedure OnBeforeEnqueueJobQueueEntry(var JobQueueEntry: Record "Job Queue Entry")
begin
    if JobQueueEntry.Description = '' then
        JobQueueEntry.Description := JobQueueEntry.GetDefaultDescription();
end;

[EventSubscriber(ObjectType::Codeunit, Codeunit::"Job Queue - Enqueue", 'OnAfterEnqueueJobQueueEntry', '', false, false)]
local procedure OnAfterEnqueueJobQueueEntry(var JobQueueEntry: Record "Job Queue Entry")
begin
    // Add custom trace, notification, or follow-up bookkeeping here.
end;
```

## 8. Telemetry starting points

Use these event IDs to distinguish failure modes fast:

- `AL0000E24`: enqueue succeeded
- `AL0000FNY`: enqueue failed
- `AL0000E25`: execution started
- `AL0000E26`: execution finished
- `AL0000HE7`: execution failed and may retry
- `AL0000I49`: rescheduled on login
- `AL0000FMG`: user-triggered run once
- `AL0000JRG`: final failure, manual intervention needed

For KQL, start from the official samples in Microsoft Learn and project the job queue id, object id, object type, scheduled task id, number of attempts, and stack trace.