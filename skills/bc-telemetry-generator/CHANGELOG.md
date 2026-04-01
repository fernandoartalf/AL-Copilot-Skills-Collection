# Changelog

All notable changes to the `bc-telemetry-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-28

### Added

- Initial skill creation
- Core telemetry helper codeunit structure with SingleInstance pattern
- Six helper procedures: LogOperationStarted, LogOperationCompleted, LogError, LogWarning, LogFeatureUsage, LogPerformanceWarning
- Event ID convention: PREFIX-AREA### (info), PREFIX-AREAE### (error), PREFIX-AREAW### (warning), PREFIX-AREAP### (performance)
- DataClassification rules table for SystemMetadata, CustomerContent, EndUserIdentifiableInformation
- Dimension builder procedure pattern per entity
- Five telemetry categories: lifecycle, error tracking, performance monitoring, feature usage, contextual
- Advanced patterns in references/:
  - Telemetry wrapper with automatic common dimensions (environment, version, company)
  - Contextual telemetry with anonymized user ID
  - Telemetry constants with Label pattern
  - TryFunction pattern with telemetry
  - Conditional telemetry via setup table toggle
  - Bulk operation summary telemetry
  - Amount range bucketing helper
  - HttpClient external API telemetry
  - Testing guidance for telemetry
- KQL queries reference file with ready-to-use queries:
  - Error analysis (common errors, error rate, call stacks)
  - Performance analysis (avg duration, P50/P95/P99, slow ops, trends)
  - Feature usage analytics (counts, trends, by company)
  - Operational dashboards (health summary, hourly volume, top events)
  - Alerting queries (high error rate, P95 latency spike)
- External references to alguidelines.dev and Microsoft Docs
