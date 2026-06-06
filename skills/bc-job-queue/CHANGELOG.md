# Changelog

All notable changes to the `bc-job-queue` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-06-02 - @cperezsx

### Changed

- Clarified that reports can be scheduled by Job Queue while `Report.Run` calls remain unsafe from background execution code.
- Added the missing lifecycle telemetry events for login reschedule and user-triggered foreground runs.
- Added a recurrent scheduling snippet to match the skill scope.
- Normalized the Microsoft Learn reference locale.

## [1.0.0] - 2026-06-02 - @cperezsx

### Added

- Initial release of the Job Queue skill for AL developers
- Decision rules to choose Job Queue versus Task Scheduler, StartSession, and page background tasks
- Four knowledge blocks: create or enqueue, parameterize, execute or retry, and monitor or diagnose
- Reusable AL scaffolds for manual enqueue, parameter binding, delayed scheduling, foreground execution
- Official and community reference map for telemetry, retries, stale jobs, and field-proven stability practices
- Release plan snippet for contribution to the AL Copilot Skills Collection