<!-- PLAN-DOC-BC-003 heading rules: H2s must NOT carry a manual numeric prefix (template auto-numbers) and MUST NOT end with a source-ID suffix like '(from US-NNN)'. H3 subsection labels keep the 'N.M ' prefix shape but translate the label text. See SKILL.md "Heading & full-content translation rules". -->
<!-- field-map: .github/skills/documentation-bc-release-note-generator/references/release-note-fields.json -->
---
id: RN-NNN
template: 6_ReleaseNote_Template.docx
language: en
title: <Release title — derived from spec, CCN, or app.json name>
version: <from app.json — e.g. 1.0.0.0>
status: draft
clientName: <from user — no default>
ccnNumber: <from user — e.g. DSD-NNNN>
issueNumber: <from user>
releaseDate: <YYYY-MM-DD>
releasedBy: <from app.json publisher — no hardcoded default>
module: <module from source spec or CCN>
createdDate: <YYYY-MM-DD>
approvedDate: ""
---

# RN-NNN – {{Title}}

## Release Summary
<!-- section-key: ReleaseSummary -->

{{ReleaseSummary}}

## Scope of Change
<!-- section-key: ScopeOfChange -->

{{ScopeOfChange}}

<!--
  Expected structure inside ScopeOfChange:

  **Tables:**
  - Table <ID> "<Object Name>" — <Caption-based functional description>

  **Table Extensions:**
  - TableExtension "<Object Name>" extends "<Base Name>" — <what was added>

  **Pages:**
  - Page <ID> "<Object Name>" (<PageType>) — <Caption-based purpose>

  **Page Extensions:**
  - PageExtension "<Object Name>" extends "<Base Name>" — <what was added>

  **Codeunits:**
  - Codeunit <ID> "<Object Name>" — <XML-doc-based purpose>

  **Permission Sets:**
  - PermissionSet "<Object Name>" — <Caption-based purpose>

  Omit any group with no entries.
-->

## Change Request Details
<!-- section-key: ChangeRequestDetails -->

{{ChangeRequestDetails}}

## Testing Setup
<!-- section-key: TestingSetup -->

{{TestingSetup}}

<!--
  Expected structure inside TestingSetup:

  **Prerequisites:**

  | Requirement | Value |
  |-------------|-------|
  | Business Central runtime | <from app.json> |
  | Application version | <from app.json> |
  | Extension | "<app.json name>" version <app.json version> installed |
  | Dependencies | <list extensions from app.json dependencies, or "None"> |
  | Permission set | <permission set name(s) assigned to the test user> |

  **Environment:**
  - <BC SaaS / On-Premises sandbox / test tenant>
  - <Any integration prerequisites — Dataverse connection, web service endpoint, etc.>

  **Functional setup:**
  - <Master-data preconditions derived from object Captions>
-->

## Testing Steps
<!-- section-key: TestingSteps -->

{{TestingSteps}}

<!--
  Expected structure inside TestingSteps:

  ### 5.1 Verify permissions
  1. ...

  ### 5.2 Test <Page Caption> (<PageType>)
  1. Open the **<Caption>** page.
  2. ...
     - **<Field caption>**: <ToolTip text> — <what to check>

  ### 5.3 Test <Page Extension Caption> extended functionality
  1. Open the base page **<Extended page name>**.
  2. ...

  ### 5.4 Test <Codeunit Caption> integration
  1. <Trigger scenario from XML doc>.
  2. ...

  Number subsections consecutively; omit any subsection that has no objects.
-->

## Known Limitations
<!-- section-key: KnownLimitations -->

{{KnownLimitations}}

<!-- Use the literal word "None" if there are no limitations. -->

## Approvals
<!-- section-key: Approvals -->

{{Approvals}}

<!--
  Expected structure inside Approvals — empty rows; signatures collected after delivery:

  | Role | Name | Decision | Date | Signature |
  |------|------|----------|------|-----------|
  | Product Owner | | | | |
  | AL Architect | | | | |
  | Client representative | | | | |
-->
