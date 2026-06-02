# Official and Community Source Map

This skill is grounded in the following sources.

## Microsoft Learn

1. Job Queue for developers
   Why it matters: canonical flow for enqueue, dispatcher, background session, error handler, performance, and telemetry.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-job-queue

2. Async processing overview
   Why it matters: decision matrix for Job Queue versus `StartSession`, `TaskScheduler.CreateTask`, and page background tasks.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-async-overview

3. Task Scheduler
   Why it matters: explains the platform execution model behind Job Queue, retry behavior, stale-task context, and background session constraints.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-task-scheduler

4. Table `Job Queue Entry`
   Why it matters: authoritative source for fields, helper methods, restart behavior, scheduling helpers, XML payload helpers, and status management.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/application/base-application/table/system.threading.job-queue-entry

5. Codeunit `Job Queue - Enqueue`
   Why it matters: official enqueue extensibility points such as `OnBeforeEnqueueJobQueueEntry`, `OnAfterEnqueueJobQueueEntry`, and scheduling interception.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/application/base-application/codeunit/system.threading.job-queue---enqueue

6. Codeunit `Job Queue Management`
   Why it matters: helper methods for creation, foreground execution, starting inactive entries, putting entries on hold, and finding stale jobs.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/application/base-application/codeunit/system.threading.job-queue-management

7. Job Queue lifecycle telemetry
   Why it matters: lifecycle event ids, custom dimensions, and KQL patterns for diagnosis and alerting.
   Link: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/telemetry-job-queue-lifecycle-trace

## Community References

8. Stefano Demiliani: scheduling Job Queue tasks via API
   Why it matters: practical S2S and API-driven scheduling pattern for automated setup scenarios.
   Link: https://demiliani.com/2022/12/12/dynamics-365-business-central-scheduling-job-queue-tasks-via-api/

9. YUN ZHU / Dynamics 365 Lab: How to run Job Queue via AL
   Why it matters: pragmatic example of foreground execution through `RunJobQueueEntryOnce` and debug-oriented workflows.
   Link: https://yzhums.com/26632/

10. Waldo: Stabilize your Job Queue
    Why it matters: field-tested guidance for retries, stale jobs, category interactions, user-region caveats, and operational hardening.
    Link: https://waldo.be/2021/05/06/stabilize-your-job-queue-a-few-tricks/

## Key Principles Derived from the Sources

- Job Queue is the right abstraction when recurrence, operability, and in-client logs matter.
- Helper methods on `Job Queue Entry` are preferable when the built-in schedule shapes fit the requirement.
- `Parameter String` should be treated as a contract, not a dumping ground.
- Background-safe code and retry-safe business logic are non-negotiable.
- Telemetry must distinguish enqueue, start, finish, retrying failure, user-run, login-reschedule, and terminal failure.