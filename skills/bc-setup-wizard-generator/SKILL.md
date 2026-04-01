---
name: bc-setup-wizard-generator
description: Generates assisted setup wizard pages for Business Central setup tables following Guided Experience patterns. Creates NavigatePage with step-based navigation using visibility controls, banner images (WIP/Finished from Media Repository), temporary source table, footer actions (Back/Next/Finish with InFooterBar), OnOpenPage trigger (InitRecord, EnableControls, LoadSetupBanner), OnQueryClosePage trigger with unsaved changes confirmation, navigation procedures (NextStep with Step Option variable, EnableControls with Case statement, SetControlsStepXX boolean updates), commit procedure using TransferFields pattern, and registration codeunit with OnRegisterAssistedSetup event subscriber for Guided Experience. Integrates with Assisted Setup page and Extension Management. Supports multi-step workflows with welcome step, configuration step(s), and review/finish step. Uses InstructionalText for user guidance. Completes setup via GuidedExperience.CompleteAssistedSetup. Use when creating setup wizards, implementing assisted setup for extensions, adding guided configuration to modules, creating multi-step setup pages, registering with Guided Experience framework, or building NavigatePage wizards with step navigation.
---

# BC Setup Wizard Generator

Automates creation of assisted setup wizards for Business Central setup tables following Guided Experience patterns.

## Overview

Generates complete NavigatePage setup wizards with step-based navigation, banner images, temporary records, and Guided Experience registration. Follows Microsoft patterns for assisted setup.

**Complete code templates available in**: [references/code-templates.md](references/code-templates.md)

## Prerequisites

- AL workspace with setup table
- Setup table with fields to configure
- (Optional) Setup page for post-wizard access

## Workflow

### Step 1: Gather Information

Collect from user:
- Setup entity name (e.g., "Statistical Account")
- Setup table name and ID
- Prefix (e.g., "BCS")
- Number of configuration steps (typically 2-4)
- Field groups per step
- Documentation URLs (video + written)

### Step 2: Plan Wizard Steps

Define wizard structure:
- **Step 1**: Welcome - InstructionalText explaining wizard purpose
- **Step 2-N**: Configuration - Field groups by logical category
- **Final Step**: Review & Finish - Read-only summary of all settings

Example 3-step wizard:
1. Welcome
2. Attachments Settings (Step 1/2)
3. Number Series Setup (Step 2/2)
4. Review & Finish

### Step 3: Create Wizard Page

Create NavigatePage with:
- `PageType = NavigatePage`
- `SourceTable = [Setup Table]`
- `SourceTableTemporary = true` ← Critical for unsaved workflow

Location: `src/Page/[Prefix][Entity]SetupWizard.Page.al`

See [code-templates.md](references/code-templates.md#wizard-page-structure) for complete structure.

### Step 4: Add Banner Groups

Add two banner groups at top of layout:
- **SetupWIPBanner**: Visible during configuration steps
- **SetupFinishedBanner**: Visible on review/finish step

Uses Media Repository records:
- `AssistedSetup-NoText-400px.png` (WIP)
- `AssistedSetupDone-NoText-400px.png` (Finished)

See [code-templates.md](references/code-templates.md#banner-groups) for complete code.

### Step 5: Add Step Groups

Create one group per step with:
- `Visible` property bound to `StepXVisible` boolean
- InstructionalText for welcome/review steps
- Field groups for configuration

**Critical**: Use step counters in captions for user guidance:
- `Caption = 'Attachments Settings 📎(Step 1/3)'`

See [code-templates.md](references/code-templates.md#step-groups) for complete patterns.

### Step 6: Add Navigation Actions

Add three actions in `area(Processing)`:
- **ActionBack**: `Enabled = BackActionEnabled`, calls `NextStep(true)`
- **ActionNext**: `Enabled = NextActionEnabled`, calls `NextStep(false)`
- **ActionFinish**: `Enabled = FinishActionEnabled`, calls `FinishAction()`

All have `InFooterBar = true` for bottom positioning.

See [code-templates.md](references/code-templates.md#navigation-actions) for complete code.

### Step 7: Add Page Triggers

**OnOpenPage**:
- Initialize temporary record from actual setup table
- Call `EnableControls()` to show first step
- Call `LoadSetupBanner()` to load banner images

**OnQueryClosePage**:
- If `FinishedProcess = true`: Commit changes, mark setup complete
- Else: Confirm user wants to exit without saving

See [code-templates.md](references/code-templates.md#page-triggers) for complete implementation.

### Step 8: Add Navigation Procedures

Create local procedures:

**ResetControls()**: Reset all visibility booleans and action states

**NextStep(Backwards: Boolean)**: Increment/decrement Step option, call EnableControls()

**EnableControls()**: Case statement routing Step to SetControlsStepXX()

**SetControlsStepXX()**: Set visibility for specific step, enable/disable actions

See [code-templates.md](references/code-templates.md#navigation-procedures) for complete code.

### Step 9: Add Data Management Procedures

**InitRecord()**: 
- Check if setup record exists
- Create temporary record from existing or initialize new

**CommitRecord()**:
- Transfer temporary record to actual setup table
- Insert if new, Modify if exists

**FinishAction()**:
- Set `FinishedProcess = true`
- Close page (triggers OnQueryClosePage commit)

See [code-templates.md](references/code-templates.md#data-management-procedures) for complete code.

### Step 10: Add Setup Banner Loading

**LoadSetupBanner()**:
- Get Media Repository records by name
- Get Media Resources by reference
- Set `BannersVisible` if media has value

See [code-templates.md](references/code-templates.md#banner-loading-procedure) for complete code.

### Step 11: Declare Variables

Declare variables:
- Record variables: Setup table, Media Repository (2), Media Resources (2)
- Codeunit: `GuidedExperience`
- Boolean: StepXVisible (per step), BackActionEnabled, NextActionEnabled, FinishActionEnabled, FinishedProcess, BannersVisible
- Option: `Step` with values matching step groups

See [code-templates.md](references/code-templates.md#variable-declarations) for complete list.

### Step 12: Create Registration Codeunit

Create codeunit with event subscriber:
- Subscribe to `Codeunit::"Guided Experience"::OnRegisterAssistedSetup`
- Call `AssistedSetup.InsertAssistedSetup()` with:
  - Title and description labels
  - Time estimate (minutes)
  - Wizard page ID
  - Assisted Setup Group
  - Video URL and category
  - Documentation URL

Location: `src/Codeunit/[Prefix][Entity]SetupManagement.Codeunit.al`

See [code-templates.md](references/code-templates.md#registration-codeunit) for complete code.

### Step 13: Build and Test

1. Build project: `al_build`
2. Publish: `al_publish`
3. Test from:
   - Assisted Setup page (search "Assisted Setup")
   - Extension Management (Setup actions)
4. Verify:
   - Navigation works (Back/Next/Finish)
   - Banners display correctly
   - Exit confirmation on close without finish
   - Changes saved on finish
   - Completion check marked

## Troubleshooting

### Wizard doesn't appear in Assisted Setup
**Cause**: Event subscriber not firing or registration failed  
**Fix**: Check `OnRegisterAssistedSetup` event subscriber syntax, verify codeunit compiles without errors

### Banners don't display
**Cause**: Media Repository records not found or media reference empty  
**Fix**: Check exact image names (`AssistedSetup-NoText-400px.png`, `AssistedSetupDone-NoText-400px.png`), verify Media Repository exists in base BC

### Changes saved even when clicking X to close
**Cause**: `OnQueryClosePage` not checking `FinishedProcess` flag  
**Fix**: Ensure `if FinishedProcess then` condition exists, verify FinishAction sets flag before CurrPage.Close()

### Steps don't navigate forward/backward
**Cause**: Step option enum values don't match group names, or EnableControls case statement incomplete  
**Fix**: Verify Step option has value for each step (Step10, Step20, Step30, etc.), check Case statement includes all values

### Error on finish: "Record already exists"
**Cause**: CommitRecord trying to Insert when record exists  
**Fix**: Check `if not SetupRecord.Get() then Insert else Modify` pattern in CommitRecord procedure

### Setup marked complete but changes not saved
**Cause**: CommitRecord not called before CompleteAssistedSetup  
**Fix**: Ensure OnQueryClosePage calls CommitRecord() before GuidedExperience.CompleteAssistedSetup()

### Review step shows editable fields
**Cause**: Review step groups missing `Editable = false` property  
**Fix**: Add `Editable = false` to all field groups in final review step

## Quick Reference

**Snippet**: Use Waldo's `tpagewizard3stepswaldo` snippet for rapid scaffolding

**Core Pattern**: Temporary record → User edits → Finish commits → Mark complete

**Key Properties**:
- Page: `PageType = NavigatePage`, `SourceTableTemporary = true`
- Actions: `InFooterBar = true`
- Groups: `Visible = StepXVisible`

**Required Codeunits**: Guided Experience (InsertAssistedSetup, CompleteAssistedSetup)

**Media Files**: `AssistedSetup-NoText-400px.png`, `AssistedSetupDone-NoText-400px.png`
