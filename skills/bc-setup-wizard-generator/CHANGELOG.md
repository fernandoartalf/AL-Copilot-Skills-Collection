# Changelog

All notable changes to the BC Setup Wizard Generator skill will be documented in this file.

## [1.0.0] - 2026-03-25

### Added

#### Wizard Page Components
- NavigatePage with SourceTableTemporary pattern
- Step-based navigation with visibility controls
- Banner groups (WIP/Finished from Media Repository)
- Three action buttons (Back/Next/Finish) with InFooterBar
- Welcome step with InstructionalText
- Configuration step groups with field layouts
- Review/Finish step with read-only summary

#### Page Triggers
- OnOpenPage: InitRecord, EnableControls, LoadSetupBanner
- OnQueryClosePage: Unsaved changes confirmation, conditional commit

#### Navigation Procedures
- ResetControls: Initialize visibility and action states
- NextStep: Step navigation with backwards parameter
- EnableControls: Case-based step routing
- SetControlsStepXX: Per-step visibility and action control

#### Data Management
- InitRecord: Temporary record initialization from setup table
- CommitRecord: TransferFields pattern with Insert/Modify
- FinishAction: Process completion flag and close
- LoadSetupBanner: Media Repository integration for banner images

#### Registration Integration
- OnRegisterAssistedSetup event subscriber
- InsertAssistedSetup call with title, description, duration
- Video URL and documentation link configuration
- Assisted Setup Group categorization
- CompleteAssistedSetup on wizard finish

#### Variables
- Setup table record (permanent and temporary)
- Media Repository and Media Resources records (2 each)
- GuidedExperience codeunit reference
- Step visibility booleans (per step)
- Action state booleans (Back/Next/Finish)
- FinishedProcess flag
- BannersVisible flag
- Step option variable

#### Code Templates
- Complete wizard page structure (985 lines)
- Banner group patterns with Media fields
- Step group templates with InstructionalText
- Navigation action implementations
- Case statement patterns for step control
- Media Repository loading procedures
- Event subscriber registration template

#### Documentation
- 13-step implementation workflow
- Troubleshooting guide with 7 common issues
- Quick reference with core patterns
- Progressive disclosure via code-templates.md

### Features
- Multi-step wizard support (welcome + N configs + review)
- Unsaved changes protection
- Guided Experience framework integration
- Extension Management compatibility
- Waldo snippet compatibility reference
