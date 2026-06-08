---
name: documentation-bc-user-story-generator
description: Create well-structured Business Central user stories in the `openspec/user-stories/` folder following the US-001 template structure. Drives a grouped interview to capture role, business context, pain points, current standard BC behavior (verified via Microsoft Learn), acceptance criteria, out-of-scope items, and open questions, then writes the file as `US-NNN-kebab-title.userstory.md` with frontmatter (id, title, Version, status, module, ProductOwner, created_date, approved_date) and a draft status. Use whenever the user requests to create, draft, write, generate, or add a new user story, US, business requirement, functional story, or anything matching phrases like "new user story", "create US", "draft a user story for [feature]", "add a user story to openspec", or when starting requirements discovery for a Business Central feature.
---

# Documentation: BC User Story Generator

Generate a new Business Central user story file under `openspec/user-stories/` following the structure of `US-001-track-sales-shipments-on-projects`.

## When to use

The user wants to capture a functional requirement for a Business Central feature in the OpenSpec format before any technical planning or implementation.

## Default output location

`openspec/user-stories/` — always. Do not ask the user where to save the file.

## Workflow

Follow these steps in order. Do not skip the interview or the Microsoft Learn verification step.

### Step 1 — Allocate the next US ID

1. List files in `openspec/user-stories/` matching `US-*.userstory.md` (and `US-*.story.md` if present).
2. Parse the highest existing numeric ID and increment by 1.
3. Format as `US-NNN` (zero-padded to 3 digits, e.g. `US-002`, `US-014`).
4. If the folder does not exist, start at `US-001`.
5. If the allocated filename would collide with an existing file, re-increment until free. Never overwrite.

### Step 2 — Grouped interview (upfront, before drafting)

Use `vscode_askQuestions` to collect ALL of the following in a single grouped interview before drafting. Each field is mandatory — do not auto-fill frontmatter values silently.

**Frontmatter inputs (ALL required):**
- `title` — short human title (used in filename + H1)
- `Version` — propose `1.0.0`; user confirms
- `module` — one or more BC functional modules (e.g. `Projects, Sales`)
- `ProductOwner` — full name (must be provided; never invent)
- `prepared_by` — full name of the person preparing the document (must be provided; never invent)
- `created_date` — propose today's date; user confirms

**Story content (required):**
- **Role** — *"As a..."* (specific persona, not a generic "user")
- **Want** — *"I want..."* (the capability)
- **So that** — *"so that..."* (the business value)
- **Business Context** — current situation and at least 2 concrete operational pain points
- **Modules / areas of BC affected**
- **Real-world examples** — one or two concrete usage scenarios

**Scope (required):**
- **Acceptance Criteria** — minimum **3** ACs. For each, capture a short title and bullet details (mirroring `AC1 — <title>` style from US-001).
- **Out of Scope** — at least one item.
- **Open Questions** — at least one. If the user has none, propose ambiguities you detected and ask them to confirm/answer.

If any answer is vague, ambiguous, or contradicts another, ask a **focused follow-up before continuing**. Specifically flag and reject:
- ACs that use subjective or unverifiable language: "should", "might", "usually", "as fast as possible", "user-friendly", "appropriate". Rewrite with the user into objective, testable statements.
- ACs whose acceptance threshold is implicit (e.g. "the amount is shown" — shown where? always? only when non-zero?).
- Role definitions that are too generic (e.g. "a user" — which user? which permission set?).

Never invent values for the frontmatter or the ACs.

### Step 2b — Blind spot & corner case review

After collecting all interview answers and **before** verifying BC behavior, enumerate the blind spots and corner cases you detected in the functional description. Surface them to the user via `vscode_askQuestions` as a single grouped review. For each identified issue, offer three disposition options:
- **In scope — add as AC**: creates a new Acceptance Criterion.
- **Out of scope — add to Out of Scope list**: explicitly excluded.
- **Unclear — add as Open Question**: escalated to the Product Owner.

Minimum areas to check (generate at least one question per applicable area; skip only if demonstrably irrelevant):

1. **Missing-entity edge cases** — What happens if a linked entity does not exist yet? (e.g. driver not yet a BC Resource, vehicle not registered, no issuing authority in the catalogue.)
2. **Deletion / de-activation cascades** — What happens to existing records if a referenced catalogue entry or master-data record is deleted or blocked?
3. **Duplicate / concurrent creation** — Can two users create the same record simultaneously? Is uniqueness enforced?
4. **Boundary values** — What is the behavior with zero amounts, maximum text lengths, empty free-text fields, or a record with no attachments?
5. **Incomplete lifecycle paths** — Are all status transitions covered? What happens when a record is re-opened after being Closed? Can a record skip intermediate states?
6. **Permission / role edge cases** — Can a read-only user inadvertently trigger a write path (e.g. via a FlowField recalculation or a page action)?
7. **Implicit Out-of-Scope gaps** — Is there a near-in-scope capability the stakeholder might expect but which is not mentioned in any AC? (e.g. bulk import, printing, email notification.)
8. **Future-enhancement collisions** — Do any Future Enhancements contradict the data model implied by the current ACs?

Do not proceed to Step 3 until all raised blind spots have been assigned a disposition.

### Step 3 — Verify the Current Situation in standard BC

Before drafting the *Current Situation (Standard Business Central)* section:

1. Call `microsoft_docs_search` (and `microsoft_docs_fetch` when deeper detail is needed) to confirm how the relevant standard BC functionality works today.
2. Cite verified facts as bullets, naming the relevant standard objects, actions, or batches explicitly.
3. End the section with a `**Conclusion:**` paragraph stating exactly what standard BC already supports and what the missing gap is.
4. If the docs do not cover the topic, say so explicitly in the section and add an entry to **Open Questions** asking the user to confirm.

Never fabricate standard BC behavior. If unverifiable, mark with `> ⚠ Needs validation against the customer's BC version`.

### Step 4 — Build the filename

Format: `US-NNN-<kebab-title>.userstory.md`

- `<kebab-title>` is the lowercase, hyphen-separated title with diacritics stripped and non-alphanumerics removed.
- Validate the pattern matches `^US-\d{3}-[a-z0-9]+(-[a-z0-9]+)*\.userstory\.md$` before writing. Regenerate the slug if validation fails.

### Step 5 — Write the file

Create the file at `openspec/user-stories/<filename>` using the template in `references/user-story-template.md`. The file MUST contain, in this exact order:

1. YAML frontmatter:
   ```yaml
   ---
   id: US-NNN
   title: <Title>
   version: <Version>
   status: draft
   module: <Module(s)>
   productOwner: <Full Name>
   prepared_by: <author name>
   created_date: <YYYY-MM-DD>
   approved_date:
   ---
   ```
2. `# US-NNN — <Title>` H1
3. `## User Story` — the bold-prefixed As/I want/So that block
4. `## Business Context`
5. `## Current Situation (Standard Business Central)` — verified bullets + `**Conclusion:**` paragraph
6. `## Acceptance Criteria` — `### AC1 — <name>` … `### ACn — <name>` (minimum 3)
7. `## Out of Scope`
8. `## Open Questions` — numbered list

### Step 6 — Confirm and report

After writing, report to the user:
- The path of the created file (as a markdown link)
- The allocated `US-NNN` id
- A one-line summary of what was created
- Any **Open Questions** that still need answers from the Product Owner

## Heading & full-content translation rules

Every artefact produced by this skill MUST follow these rules. They exist so
the downstream `documentation-bc-md-to-docx-converter` pipeline (AXZ Word
templates) renders correctly in every supported language and so headings
never leak design-time tokens.

1. **No manual H2 numeric prefix.** Write `## Business context`, never
   `## 2. Business context`. The Word template's multilevel-list style
   numbers the H2s automatically; a manual `N. ` prefix produces double
   numbering (e.g. `2. 2. Business context`) in the rendered docx.
2. **No source-ID suffix in any heading.** Drop trailing parentheticals
   such as `(from US-NNN)`, `(from US-<NNN>)`, `(procedente de SPEC-001)`,
   `(aus ARCH-NNN)`, etc. Trace links to source artefacts belong in the
   frontmatter or section body, not in the visible heading text.
3. **Translate H3 subsection labels.** Subsections keep their `N.M ` prefix
   shape (e.g. `### 3.1 …`) but the label text MUST be translated into the
   target language declared in the frontmatter `language` / `locale` field.
4. **Translate the ENTIRE table.** When a target language is set, every
   column header AND every cell value in every table MUST be in that
   language. No English fallbacks for cells, no mixed-language rows. Code
   identifiers (object names, field names, AL keywords) stay verbatim;
   surrounding prose translates.
5. **Regression guard.** Before saving, scan the artefact for these
   anti-patterns and fix them:
   - `^## \d+(?:\.\d+)*\.\s` (numeric-prefixed H2)
   - `\((?:from|procedente de|issu[e]? de|aus|da|de|uit)\s+[A-Z]+-\S+\)\s*$`
     on any heading line (source-ID suffix)
   - English column headers when the document is non-English.

> Origin: defects discovered while producing `CCN-001-driver-penalty-management`.
> Tracked in `docs/plans/PLAN-documentation-bc-heading-translation-fix.md` (PLAN-DOC-BC-003).

## Hard rules

- **status MUST always be `draft`** on initial creation.
- **approved_date MUST be empty** on initial creation.
- **Never** create the file if any required interview field is missing.
- **Never** invent a `ProductOwner` — the user must provide it.
- **Never** write more than one user story per invocation.
- **Never** overwrite an existing user story file. On collision, re-allocate the ID.
- Acceptance Criteria count MUST be ≥ 3.
- Out of Scope and Open Questions sections MUST be present and non-empty.
- Default output folder is `openspec/user-stories/` — never ask.
- **Never** accept a vague AC — any AC containing subjective or unverifiable language ("should", "might", "user-friendly", "appropriate", "as needed") MUST be rewritten with the user before the file is created.
- **Never** skip Step 2b — the blind spot & corner case review is mandatory. Every identified blind spot MUST have a recorded disposition (In scope / Out of scope / Open Question) before the file is written.

## Reference

- `references/user-story-template.md` — the exact markdown skeleton.
- `references/user-story-fields.json` — canonical, language-neutral static field/section keys used to drive the mandatory JSON output (below) and any downstream `md-to-docx-converter` template.

## Mandatory JSON output

On **every** invocation, in addition to writing the `.md` file the skill MUST also write a sibling JSON file:

- Path: same folder as the markdown, filename pattern `US-NNN-<kebab-title>.userstory.json` (see `outputJson.filePattern` in `references/user-story-fields.json`).
- Encoding: UTF-8, pretty-printed (2-space indent).
- Shape:
  ```json
  {
    "artifactType": "US",
    "id": "US-NNN",
    "language": "<bcp47-primary-subtag>",
    "frontmatter": { "<yamlKey>": "<value>", ... },
    "sections":    { "<CanonicalKey>": "<markdown body of the section, translated>", ... }
  }
  ```
- **Keys** (both in `frontmatter` and in `sections`) MUST come **verbatim** from `references/user-story-fields.json` (`frontmatterFields[].key` and `sections[].key`). They are byte-stable across runs and languages so they can bind 1:1 to placeholder tokens in any Word template.
- **Values** carry the content in the chosen target language.
- Every H2 in the generated markdown MUST be immediately followed by `<!-- section-key: <CanonicalKey> -->` on its own line so the same map can be reconstructed by parsing the `.md` after the fact.
- Failure to emit the JSON file is a hard failure of the skill — abort and report rather than producing only the markdown.

## Downstream rendering dependency (mmdc)

The markdown produced by this skill is intended to be converted to `.docx` by the `documentation-bc-md-to-docx-converter` skill. Any Mermaid block in the output — whether emitted as an explicit `<!-- DIAGRAM: mermaid ... -->` marker or as a bare triple-backtick `` ```mermaid `` fence — is rendered to PNG by the Mermaid CLI (`mmdc`). When `mmdc` is unavailable the converter falls back to the diagram's plain-text content, so generated documents stay readable but lose their visual diagrams.

Install once per machine (Node.js required):

```pwsh
npm install -g @mermaid-js/mermaid-cli
mmdc --version
```

Inline `![alt](path)` images in the generated markdown are also embedded into the docx body by the converter (resolved relative to the markdown file, then to repo root). Missing image files are left as literal text and produce a warning.

## Pre-completion self-check — section-key anchors (MUST)

> **This step is mandatory before reporting the artefact as done. It enforces the language-neutral binding contract used by the documentation-bc-md-to-docx-converter.**

After writing the markdown file, the skill MUST re-read it and verify the anchor contract:

1. For every line beginning with `## ` in the body (not inside fenced code blocks, not in YAML frontmatter), the **next non-blank line** MUST be:
   `
   <!-- section-key: <CanonicalKey> -->
   `
2. `<CanonicalKey>` MUST be one of the `sections[].key` values declared in the matching `references/*-fields.json` schema (PascalCase, English, byte-stable across languages).
3. If any H2 is missing its anchor, or its anchor uses a key not present in the schema, the skill MUST fix the file and re-save before returning control to the user.
4. The same canonical key MUST appear as a top-level key in the sibling `*.json` output emitted by this skill — NEVER a translated derivative.

Recommended automation: run python .github/skills/shared/scripts/sync-section-keys.py --dry-run against the just-written file; if it reports any missing/mismatched anchor, fix the file in place, then re-run without `--dry-run` to apply.

Failure of this self-check is a hard failure of the skill — do not deliver the artefact until every H2 carries a valid schema-backed anchor.