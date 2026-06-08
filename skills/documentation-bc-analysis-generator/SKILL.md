---
name: documentation-bc-analysis-generator
description: Create well-structured Business Central feasibility analysis documents in the `openspec/analysis/` folder as the AL Analyst's working artefact backing a CCN, following the ANALYSIS-001 template structure. Captures references to the source user story / spec / CCN, change summary, scope & impact (objects added/modified, LoC, ID range usage), phased time estimate (Optimistic / Expected / Pessimistic with contingency and calendar duration), cost estimate at a stated EUR/h rate with assumptions, SWOT analysis (Strengths / Weaknesses / Opportunities / Threats), numbered risk register (`R-NN` with Likelihood / Impact / Mitigation), and a clear GO / NO-GO / CONDITIONAL-GO feasibility recommendation with non-blocking advisories and a handoff statement back to the Architect. Writes the file as `ANALYSIS-NNN-<kebab-title>.analysis.md` with frontmatter linking back to its spec, user story, and CCN. Use whenever the user asks to create, draft, generate, or write a feasibility analysis, ANALYSIS document, cost/time estimate, SWOT, risk assessment, or GO/NO-GO recommendation for a spec or change request, with trigger phrases such as "create analysis for SPEC-NNN", "draft feasibility analysis", "estimate cost and time for [feature]", "SWOT and risk for the spec", "GO/NO-GO recommendation", or "create an analysis file in openspec/analysis".
---

# Documentation: BC Analysis Generator

Generate a Business Central feasibility analysis document under `openspec/analysis/` as the AL Analyst's working artefact that supports a change-control note (CCN) and a draft technical spec. The spec describes **what** to build, the architecture explains **why**; this document answers **is it worth building, at what cost, and what is the risk?**.

## When to use

The user has a draft technical spec (and ideally a CCN) and needs a formal feasibility decision — effort, cost, SWOT, risks, GO / NO-GO — before development begins.

## Default output location

`openspec/analysis/<filename>` — always. Do not ask the user where to save the file.

## Workflow

Follow these steps in order. Do not skip the spec validation or the GO/NO-GO recommendation step.

### Step 1 — Identify and validate the source spec

1. If the user did not specify a SPEC ID, list files in `openspec/specs/` and ask which one to analyse via `vscode_askQuestions`.
2. Read the chosen spec file and capture: `id` (SPEC-NNN), `title`, `user_story` (US-NNN), `module`, `prefix`, `id_range`, `estimated_effort` (if present), the full AL object inventory (tables, enums, pages, page extensions, codeunits, permission sets), the phase overview, and any Open Questions.
3. Read the linked user story and capture: ACs, Out-of-Scope items, Open Questions resolution status (resolved vs. still open).
4. If a CCN exists for the feature (e.g. `docs/ccn/CCN-NNN-*.md` or referenced from spec frontmatter), read it and capture: `ccn` id, requested change, business justification, approval status.
5. If the spec's Open Questions are not all resolved, warn the user — an analysis on a moving spec produces unreliable estimates. Allow override but record it as Assumption.

### Step 2 — Allocate the next ANALYSIS ID

1. List files in `openspec/analysis/` matching `ANALYSIS-*.analysis.md`.
2. Parse the highest existing numeric ID and increment by 1; format as `ANALYSIS-NNN` (zero-padded to 3 digits).
3. If the folder does not exist or is empty, start at `ANALYSIS-001`.
4. If the allocated filename would collide, re-increment until free. Never overwrite.

### Step 3 — Research the workspace to ground the estimate

Mandatory before drafting the time and cost tables:

1. Re-read `app.json` for `application` version, `runtime`, `name`, `publisher`, and `idRanges` — confirms object-ID availability claimed in the spec.
2. Use the `Explore` subagent (thoroughness `quick` or `medium`) to inventory existing AL objects under `src/` that the new objects depend on, reuse, or coexist with. The reuse vs. greenfield ratio drives the estimate.
3. Count the spec's planned new AL objects (tables, enums, pages, page extensions, codeunits, permission sets) and modified objects. Record both in §3 of the analysis.
4. Sanity-check the spec's phase decomposition — every phase MUST end with green build + green tests; if a phase appears non-shippable, flag as a SWOT Weakness.

### Step 3b — Blind spot & assumption review

After researching the workspace and **before** verifying BC mechanisms or building the estimate, enumerate the tacit assumptions and analytical blind spots you detected in the spec, user story, and codebase. Surface them to the user via `vscode_askQuestions`. For each item, offer three dispositions:
- **Confirm the assumption is valid** — recorded in §5 Assumptions with justification.
- **Assumption is invalid / uncertain** — the relevant phase estimate is escalated to Pessimistic and a Risk entry is added.
- **Out of scope** — recorded in §2 Change summary as explicitly excluded.

Minimum areas to check (raise at least one question per applicable area):

1. **Unresolved Open Questions** — For every Open Question in the user story or spec that is still in status "Escalated" or "Functional question", flag it explicitly. An analysis built on unresolved functional decisions produces unreliable estimates.
2. **Pre-requisite data & configuration** — Does the estimate assume that master data (Resources, Employees, No. Series, catalogue tables) is already configured in the target tenant? If so, is that a valid assumption for go-live?
3. **Test-data availability** — Does the testing strategy require realistic data (e.g. existing penalties, vehicle registrations, driver records)? Who is responsible for providing it, and is the time to create it included in the estimate?
4. **Vague spec language** — Flag any spec section whose scope is ambiguous (e.g. fields described as "TBD", phases with no task breakdown, ACs that use "should" or "might"). These inflate estimation uncertainty; list them as Weaknesses in §6.
5. **Phase shippability gaps** — If a phase produces objects that cannot be independently tested (e.g. a codeunit with no test harness, a table with no page), it is a non-shippable phase. Flag this as a risk.
6. **External dependencies not estimated** — Does any phase depend on input from the customer (data migration files, configuration decisions, third-party API credentials)? Is customer wait-time included in calendar duration?
7. **BC version / platform constraints** — Does the spec use any mechanism whose availability on the target BC `application` version is not yet verified (Step 4)? Treat as Pessimistic until verified.
8. **Scope creep vectors** — Are there any near-in-scope capabilities implied by the spec (e.g. a list page implies the user will want filtering, sorting, export) that are explicitly excluded? Record them as Threats if they are likely to resurface as change requests.

Do not proceed to Step 4 until all raised assumptions have been assigned a disposition.

### Step 4 — Verify standard BC assumptions used in the estimate

For every estimate line that relies on reuse of a standard BC mechanism (RecordRef / FieldRef, EnqueueBackgroundTask, RapidStart configuration packages, No. Series, Permission Sets, virtual tables `AllObj` / `Field`, Document Attachment, etc.):

1. Call `mcp_microsoftdocs_microsoft_docs_search` to confirm the mechanism exists on the BC `application` version from `app.json`.
2. If unverified, raise the corresponding phase's estimate to **Pessimistic** and record an Assumption.
3. If documentation contradicts the spec's reuse claim, downgrade the recommendation toward **CONDITIONAL-GO** and surface a blocking advisory.

### Step 5 — Build the per-phase estimate

1. **Hours table** — one row per phase from the spec's §8 phase overview, with three columns: `Optimistic (h)`, `Expected (h)`, `Pessimistic (h)`. Add a Subtotal row, then a 20 % contingency on Expected, then a Total row.
2. Each phase estimate MUST be defensible against the task list in the spec's `PLAN-NNN-PN-*.plan.md` file (or the spec's §8 if plans don't yet exist). Do not invent tasks.
3. **Calendar duration** — translate Total hours to working days assuming a single AL developer FTE at 7 productive h/day (default), sequential phases. Use rounded `~weeks` for wall-clock.
4. **Rate** — default **EUR 80 / hour**. If the user specifies a different rate or currency, use it and record it in §5 Rate line.
5. **Cost** — multiply Optimistic / Expected / Pessimistic Total hours by the rate. Provide a per-phase cost breakdown for the Expected scenario.
6. **Assumptions** — record at least: developer familiarity, mock-vs-live testing strategy, exclusions (translation / licensing / sandbox), and architect review cycles.

### Step 6 — Build the SWOT analysis

1. Minimum 3 bullets per quadrant: **Strengths**, **Weaknesses**, **Opportunities**, **Threats**.
2. Bullets MUST be specific to the spec — generic statements like "good design" are not acceptable. Reference object IDs, ACs, or design decisions where useful.
3. Strengths typically include: additive-only change, mature reuse, phased shippability, test strategy.
4. Weaknesses typically include: performance edge cases, UI gaps explicitly accepted by the US, length/format limits.
5. Threats MUST include the *cost of NOT implementing* (the do-nothing baseline) — this is a standard Avvale practice.

### Step 7 — Build the numbered risk register

1. Table columns: `# | Risk | Likelihood | Impact | Mitigation`.
2. IDs are `R-01`, `R-02`, … (zero-padded to 2 digits).
3. `Likelihood` and `Impact` MUST each be one of: `Low`, `Medium`, `High`.
4. Every risk MUST have a non-empty `Mitigation` — point to the phase/task or AC that covers it. If a risk has no mitigation, escalate it to a blocking advisory in §8.
5. Add a closing line `**Overall risk rating: <LOW | LOW–MEDIUM | MEDIUM | MEDIUM–HIGH | HIGH>**` based on the highest-Likelihood/Impact combination.

### Step 8 — Issue the feasibility recommendation

1. Pick exactly one verdict: **GO** (unconditional), **CONDITIONAL-GO** (with explicit pre-conditions), or **NO-GO**.
2. Justify the verdict in one short paragraph that cites: technical complexity, additive-vs-invasive nature, scope-creep risk, expected cost vs. strategic value.
3. List **Non-blocking advisories at kick-off** as numbered bullets (typical: reserve test tenant, defer migration to separate CCN, grooming items for v2, frontmatter backfills).
4. Never issue `GO` if any High-Impact risk has High-Likelihood without an in-phase mitigation. In that case, downgrade to `CONDITIONAL-GO` and state the pre-condition.

### Step 9 — Build the filename

Format: `ANALYSIS-NNN-<kebab-title>.analysis.md`

- `<kebab-title>` is the lowercase, hyphen-separated title (diacritics stripped, non-alphanumerics removed, hyphens collapsed). Typically equal to the spec's kebab title.
- Validate against `^ANALYSIS-\d{3}-[a-z0-9]+(-[a-z0-9]+)*\.analysis\.md$` before writing.

### Step 10 — Write the analysis document

Create the file at `openspec/analysis/<filename>` using the template in `references/analysis-template.md`. The file MUST contain, in this exact order:

1. YAML frontmatter:
   ```yaml
   ---
   id: ANALYSIS-NNN
   title: Feasibility analysis — <Title>
   version: 1.0.0
   status: draft
   spec: SPEC-NNN
   user_story: US-NNN
   ccn: <CCN-NNN or empty>
   prepared_by: <author name>
   date: <YYYY-MM-DD>
   recommendation: <GO | CONDITIONAL-GO | NO-GO>
   related_docs:
     - openspec/specs/SPEC-NNN-<kebab-title>.spec.md
     - openspec/userstories/US-NNN-<kebab-title>.userstory.md
     # add CCN doc only if it exists
   ---
   ```
2. `# ANALYSIS-NNN — Feasibility analysis for SPEC-NNN` H1.
3. A leading paragraph naming the analysis as the AL Analyst's output backing the CCN, with markdown links to the spec, user story, and CCN.
4. `## 1. References` — table of source artefacts (`Artefact | Path | Status`).
5. `## 2. Change summary` — bullet list of new objects, modified objects, and explicit "zero legacy touched" / migration-deferred statement (echoing the US Out-of-Scope).
6. `## 3. Scope & impact` — single table with columns `Dimension | Value`. Minimum rows: new AL objects, existing objects modified, legacy factboxes/objects modified, BC modules touched, external dependencies added, net new AL LoC estimate, object ID range usage. Close with a one-line Open-Questions resolution status from the source US.
7. `## 4. Time estimate` — leading paragraph (blended rate, contingency note), then the per-phase hours table, then the calendar-duration table.
8. `## 5. Cost estimate` — rate line, cost-per-scenario table, per-phase Expected-scenario cost breakdown, `### Assumptions` subsection.
9. `## 6. SWOT analysis` — `### Strengths`, `### Weaknesses`, `### Opportunities`, `### Threats` subsections (in this exact order).
10. `## 7. Risk assessment` — risk register table and overall risk rating line.
11. `## 8. Feasibility recommendation` — `### **<VERDICT>** — <unconditional | with conditions>` heading, justification paragraph, `### Non-blocking advisories at kick-off` numbered list. If verdict is `CONDITIONAL-GO`, add `### Pre-conditions` numbered list above the advisories.
12. `## 9. Handoff back to the Architect` — bullet list of the next decision points (typically: accept → set SPEC to `approved`; reject → revise SPEC and re-analyse).

### Step 11 — Optional spec back-link

If, and only if, the source spec does not yet reference this analysis, you MAY append the ANALYSIS file to the spec's frontmatter `related_docs` list (if present) or add a one-line "Analysis: [ANALYSIS-NNN](...)" pointer near §1. Do not change the spec's `status` or any other field.

### Step 12 — Confirm and report

After writing, report to the user:

- Path of the created analysis file (as a markdown link).
- The allocated `ANALYSIS-NNN` id.
- The verdict (`GO` / `CONDITIONAL-GO` / `NO-GO`) and the Expected-scenario cost and duration.
- The number of risks and the overall risk rating.
- Any pre-conditions or non-blocking advisories the user must action.
- The next recommended action (typically: present to Architect for spec approval, or revise the spec on `CONDITIONAL-GO`).

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

- **status MUST always be `draft`** on initial creation. **version MUST be `1.0.0`**.
- **The `prepared_by` frontmatter field is mandatory.** It must contain the full name of the human user — never an agent role or agent name. If the author name is not evident from context (git user, previous artefacts, or explicit user input), ask the user before writing the file.
- **Default folder is `openspec/analysis/`** — never ask, never write elsewhere.
- **File extension MUST be `.analysis.md`**.
- **Never** create an analysis file without a referenced spec — the `spec:` frontmatter field is mandatory.
- **Never** invent risks, costs, or hours — every estimate MUST be derivable from the spec's phases or the linked plan files.
- **Never** assert standard BC reuse without Microsoft Learn verification (Step 4). Unverified assumptions push the phase estimate to Pessimistic.
- **Never** overwrite an existing analysis file. On collision, re-allocate the ANALYSIS ID.
- **Never** issue `GO` when a High-Impact + High-Likelihood risk lacks an in-phase mitigation — downgrade to `CONDITIONAL-GO`.
- Every SWOT quadrant MUST have at least 3 bullets, all specific to the spec.
- Every risk in §7 MUST have a non-empty Mitigation.
- The analysis document MUST NOT contain AL source code. Estimates, tables, and prose only.
- The `recommendation:` frontmatter field MUST match the verdict heading in §8 exactly.
- **Never** skip Step 3b — the blind spot & assumption review is mandatory. Every raised assumption MUST have a recorded disposition before estimation begins.
- **Never** issue `GO` or `CONDITIONAL-GO` on a spec that contains vague language without recording each vague item as a SWOT Weakness and as a Pessimistic-scenario assumption.

## References

- `references/analysis-template.md` — full markdown skeleton with frontmatter, all 9 sections, example table rows, and placeholder tokens.
- `references/analysis-fields.json` — canonical, language-neutral static field/section keys used to drive the mandatory JSON output (below) and any downstream `md-to-docx-converter` template.

## Mandatory JSON output

On **every** invocation, in addition to writing the `.analysis.md` file the skill MUST also write a sibling JSON file:

- Path: same folder as the markdown, filename pattern `ANALYSIS-NNN-<kebab-title>.analysis.json` (see `outputJson.filePattern` in `references/analysis-fields.json`).
- Encoding: UTF-8, pretty-printed (2-space indent).
- Shape:
  ```json
  {
    "artifactType": "ANALYSIS",
    "id": "ANALYSIS-NNN",
    "language": "<bcp47-primary-subtag>",
    "frontmatter": { "<yamlKey>": "<value>", ... },
    "sections":    { "<CanonicalKey>": "<markdown body of the section, translated>", ... }
  }
  ```
- **Keys** (both in `frontmatter` and in `sections`) MUST come **verbatim** from `references/analysis-fields.json` (`frontmatterFields[].key` and `sections[].key`). They are byte-stable across runs and languages so they can bind 1:1 to placeholder tokens in any Word template.
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