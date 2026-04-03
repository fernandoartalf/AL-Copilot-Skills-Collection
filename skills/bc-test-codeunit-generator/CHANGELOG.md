# Changelog

All notable changes to the `bc-test-codeunit-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-31 - @fernandoartalf

### Added

- Initial SKILL.md with test codeunit and test runner generation patterns
- Test method types reference (Test, MessageHandler, ConfirmHandler, PageHandler, ModalPageHandler, HyperlinkHandler, SendNotificationHandler, RecallNotificationHandler, RequestPageHandler, ReportHandler, FilterPageHandler, StrMenuHandler, SessionSettingsHandler)
- Given/When/Then naming convention for test methods
- Test categories: Setup, Page Navigation, Codeunit Logic, Error Validation, Event Subscriber
- Handler method patterns for MessageHandler, ConfirmHandler, ModalPageHandler, PageHandler
- TestPage methods reference table (OpenNew, OpenEdit, OpenView, Close, GoToRecord, etc.)
- Test runner codeunit documentation with TestIsolation property
- OnBeforeTestRun/OnAfterTestRun trigger documentation
- Workflow for analyzing modules, creating test codeunits, and updating test runners
- Design guidelines (one assertion per test, independent tests, Initialize pattern, LibraryVariableStorage)
- File naming convention and checklist
- External references to Microsoft Docs (test codeunits, test runners, handler methods, TestPage)
- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
- `references/test-examples.md` with 10 full working examples:
  - Setup and navigation test codeunit
  - Comprehensive module test with handlers (MessageHandler, ConfirmHandler, ModalPageHandler)
  - Basic test runner codeunit
  - Test runner with telemetry logging
  - Table-based test suite runner
  - Wizard page test with step navigation
  - API page test
  - Event subscriber test
  - Updating an existing test runner
  - TestPermissions and permission set testing
