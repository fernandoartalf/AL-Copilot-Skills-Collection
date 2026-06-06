# Release Plan Entry Snippet

This skill is intentionally being submitted in the same Pull Request as its June 2026 release-plan entry.

## Suggested Status

`🔵 In Development`

## Suggested Summary Row

| Skill | Status | Summary | Owner |
| --- | --- | --- | --- |
| `bc-job-queue` | 🔵 In Development | Guides AL developers through Job Queue creation, parameterization, execution and retry, and monitoring and diagnostics in Business Central. | `@cperezsx` |

## Suggested Detailed Entry

### bc-job-queue

- Status: 🔵 In Development
- Owner: `@cperezsx`
- Scope: Reusable Job Queue guidance for AL developers
- Includes:
  - create or enqueue patterns
  - parameter contracts and helper methods
  - execution, retry, restart, and stale-job recovery guidance
  - monitoring and telemetry patterns
- Source basis:
  - Microsoft Learn Job Queue, Async overview, Task Scheduler, Base App object docs, telemetry docs
  - Community field guidance from Stefano Demiliani, YUN ZHU, and Waldo

## Suggested PR Description

Adds `bc-job-queue`, a reusable Business Central skill for AL developers that covers the full Job Queue lifecycle: creation, parameterization, execution and retry, and diagnostics. The skill is grounded in Microsoft Learn and augmented with field-proven community guidance for stale jobs, retries, API-based scheduling, and telemetry-driven troubleshooting.