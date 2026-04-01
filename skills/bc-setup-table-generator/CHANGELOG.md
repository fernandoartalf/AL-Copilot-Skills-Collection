# Changelog

All notable changes to the `bc-setup-table-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-28

### Added

- Initial skill creation
- Basic setup table structure with singleton pattern
- Setup page with auto-initialization on OnOpenPage
- GetRecordOnce helper pattern for performance optimization
- Common field patterns:
  - Enable/Disable features (Boolean)
  - Number Series references
  - Default values (Location, Customer, Item references)
  - User ID references with proper DataClassification
  - API integration settings (URL, Masked API keys)
  - File paths and directories
- Setup page layout patterns with logical grouping
- Promoted actions (Reset to Defaults, Test Connection)
- Pre-flight implementation checklist
- Common variations:
  - Multi-tab setup pages
  - Setup field validation
  - Setup table extension pattern
- Best practices for singleton enforcement, DataClassification, and ToolTips
- External references to Microsoft Docs and BC patterns
- Advanced patterns file in references/ directory
