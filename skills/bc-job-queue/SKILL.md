---
name: bc-job-queue
description: >
  Guides AL developers through creating, parameterizing, executing, retrying,
  and diagnosing Business Central Job Queue workloads. Use when asked to enqueue
  codeunits or reports, pass parameters through Job Queue Entry, schedule
  recurring jobs, run or restart failed entries, compare Job Queue with
  TaskScheduler or StartSession, or add telemetry and diagnostics around
  background processing. Triggers: "job queue", "enqueue", "ScheduleJobQueueEntry",
  "Parameter String", "RunJobQueueEntryOnce", "Restart", "task scheduler",
  "job queue telemetry", "background session", "failed job".
---

# Business Central Job Queue Skill

## Purpose

Use this skill to design or troubleshoot Job Queue solutions in Business Central
with a development-first focus. Prefer official platform and Base Application
APIs, keep generated code safe for background sessions, and inspect target
runtime symbols before relying on method signatures or event contracts.

## Scope Boundaries

- In scope: AL design, enqueueing, parameter contracts, retry strategy, recovery, telemetry, and diagnostics.
- Out of scope: tenant administration runbooks, infrastructure-only monitoring, and customer-specific operational data.
- Always verify the target runtime symbols for `Job Queue Entry`, `Job Queue - Enqueue`, and `Job Queue Management` before generating final AL.

## Decision Rule

Choose the async primitive before writing code.

| Need | Prefer |
| --- | --- |
| User-managed schedule, recurrence, Business Central logs, admin UI | Job Queue |
| One-shot queued background task without Business Central admin UI | Task Scheduler |
| Immediate background execution from current flow | StartSession |
| Read-only work bound to an open page | Page Background Task |

Use Job Queue when the user must be able to inspect entries, change scheduling,
re-run jobs, or review logs in Business Central.

## Working Sequence

1. Confirm that Job Queue is the right primitive.
2. Choose the creation pattern.
3. Define the parameter contract.
4. Make the runnable object background-safe and retry-safe.
5. Add recovery and diagnostics before considering the work complete.

## Knowledge Block 1: Create / Enqueue

Use this block when the user asks to create a new background process, schedule it,
or expose configuration that results in a Job Queue Entry.

### Core Rules

1. Prefer Job Queue over raw `TaskScheduler.CreateTask` when end users need to see or modify the schedule.
2. If the runtime exposes a suitable helper, prefer table methods such as `ScheduleJobQueueEntry`, `ScheduleJobQueueEntryWithParameters`, `ScheduleJobQueueEntryForLater`, or recurrent scheduling helpers.
3. If you need full control over the entry, initialize `Job Queue Entry` explicitly and enqueue it through `Codeunit::"Job Queue - Enqueue"`.
4. Set the minimum viable fields for manual creation: object type, object id, description, earliest start, retry policy, and parameter payload.
5. Use category codes only when serialized execution is intentional.
6. Reports can be scheduled as Job Queue objects, but report execution paths must still avoid UI-only behavior and should use report parameter helpers for request page payloads.

### Creation Checklist

- Is the target object a codeunit or report that can run without UI?
- Does the request need one-shot, delayed, or recurrent execution?
- Will the execution user have permissions for all called objects?
- Are retry settings explicit instead of implicit defaults?
- Is the description stable enough for operations and support?

### Red Flags

- Polling too frequently instead of using a better trigger.
- Creating many near-duplicate entries that should be one parameterized job.
- Encoding business meaning only in `Description`.

## Knowledge Block 2: Parameterize

Use this block when the background code needs business context.

### Core Rules

1. Prefer `TableNo = "Job Queue Entry"` on the runnable codeunit when the job consumes `Parameter String`, `Record ID to Process`, or report parameter payloads.
2. Keep `Parameter String` deterministic, culture-neutral, and compact.
3. Use `Record ID to Process` when the job acts on one specific record and identity matters more than text parsing.
4. For richer report payloads, use XML or report parameter helpers instead of overloading `Parameter String`.
5. Parse and validate parameters at the entry point before doing business work.

### Parameter Design Heuristics

- Prefer machine formats such as `YYYYMMDD`.
- Prefer stable identifiers over captions.
- Keep parsing local and fail fast.
- If the payload is larger than the field limit, persist the payload elsewhere and pass a lookup key.

### Anti-Patterns

- Locale-dependent parsing based on user language.
- Free-form text payloads that are not contract-based.
- Searching for the current in-process entry when `Rec` can be bound directly.

## Knowledge Block 3: Execute / Retry

Use this block when the request involves foreground testing, retry policies,
restarts, stale jobs, or stability hardening.

### Core Rules

1. Runnable objects must be background-safe.
2. Treat `Confirm`, `Page.Run`, `Page.RunModal`, `Report.Run`, `Report.RunModal`, `Hyperlink`, `File.Upload`, and `File.Download` as invalid when called from background execution code. This does not prohibit scheduling a report itself through `Job Queue Entry`.
3. Use `GuiAllowed()` only to isolate optional UI behavior that may also run in foreground.
4. Use `Job Queue Management.RunJobQueueEntryOnce` for foreground testing when the user wants to validate a configured entry interactively.
5. Choose retry settings intentionally, especially for integrations and transient dependencies.

### Retry Guidance

- If the job depends on transient external services, favor several attempts with a meaningful delay window.
- If the job posts data or performs irreversible writes, make retry safety explicit before increasing attempts.
- If a job can become stale because of restarts, upgrades, or category serialization, add a recovery path and observability.

### Recovery Checklist

- Can the job be rerun safely?
- Is the failure transient, configuration-related, or business-data-related?
- Is a manual restart enough, or is data repair needed first?
- Are stale entries detectable through platform helpers or telemetry?

## Knowledge Block 4: Monitor / Diagnose

Use this block when the user asks how to observe, debug, or stabilize Job Queue behavior.

### Core Rules

1. Always give the user at least one in-client diagnosis path and one telemetry path.
2. In-client tools: `Job Queue Entries`, `Log Entries`, `Scheduled Tasks`, and `Session Event` table `2000000111`.
3. Distinguish enqueue failures from execution failures and final-stop failures.
4. Surface the official lifecycle event IDs and explain what each one proves.
5. If custom notifications are needed, prefer supported extensibility points such as enqueue events or validated status transitions.

### Lifecycle Events to Watch

- `AL0000E24`: enqueued successfully.
- `AL0000FNY`: failed to enqueue.
- `AL0000E25`: started.
- `AL0000E26`: finished.
- `AL0000HE7`: failed but may retry.
- `AL0000I49`: rescheduled on login.
- `AL0000FMG`: run once by a user.
- `AL0000JRG`: failed for the last time and needs intervention.

### Diagnostic Questions

1. Did the entry enqueue at all?
2. Did a scheduled task exist behind the entry?
3. Did the job enter `In Process`, `Error`, or final stopped state?
4. Is the failure due to UI callbacks, permissions, stale scheduling, bad parameters, or business data?
5. Is the job safe to restart, or does it need repair first?

## Expected Deliverables

When this skill is used well, the output should usually contain:

- An explicit Job Queue versus other async primitive decision.
- A creation or enqueue pattern.
- A parameter contract.
- A background-safe execution scaffold.
- A retry and recovery strategy.
- A monitoring and telemetry plan.

## References

- `references/code-patterns.md`
- `references/official-sources.md`
- `references/release-plan-entry.md`