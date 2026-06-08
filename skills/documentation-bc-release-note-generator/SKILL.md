---
name: documentation-bc-release-note-generator
description: Create well-structured Business Central release notes in the `docs/releasenotesmd/` folder from an approved spec, change-control note (CCN), or set of merged AL changes. Produces a single markdown release note with frontmatter (id, title, version, status, clientName, ccnNumber, issueNumber, releaseDate, releasedBy, module, createdDate, approvedDate), a fixed set of sections (Release Summary, Scope of Change, Change Request Details, Testing Setup, Testing Steps, Known Limitations, Approvals), and a sibling `*.releasenote.json` field map for downstream consumption by the `md-to-docx-converter` skill. No company, client, or publisher values are hardcoded — every identity field is either supplied by the user or read from the workspace `app.json`. Use whenever the user asks to create, draft, generate, or write a release note, RN, deployment note, change-request release document, or anything matching phrases such as "create release note", "draft release note for [client]", "generate RN from spec", "create release note for DSD-xxxx", "release note for this branch", or "prepare deployment documentation".
---

# Documentation: BC Release Note Generator

Generate a Business Central release note under `docs/releasenotesmd/` plus the sibling `.releasenote.json` field map. The release note is the single stakeholder-facing artefact handed off to the client at deployment time, summarising **what** changed, **why**, **how it was tested**, and **who approved it**.

This skill is the documentation-bc counterpart to the legacy `bc-release-note-generator` skill. Unlike that legacy skill, it:

- Uses a canonical, language-neutral field map (`references/release-note-fields.json`).
- Emits a sibling JSON file alongside the markdown so the `md-to-docx-converter` can drive any Word template without re-parsing.
- Hardcodes **no** company, client, publisher, or organisation values — they are all extracted from `app.json` or asked from the user.

## When to use

The user wants a release note for an approved change — typically after a CCN has been signed off, a spec has been implemented, or a branch is ready to be deployed.

## Default output locations

- Release note markdown: `docs/releasenotesmd/RN-NNN-<kebab-title>.releasenote.md`
- Sibling JSON map:      `docs/releasenotesmd/RN-NNN-<kebab-title>.releasenote.json`

Never ask the user where to save the files.

## Workflow

Follow these steps in order. Do not skip the workspace read or the completeness validation step.

### Step 1 — Identify the source change

Ask the user via `vscode_askQuestions` (only if not already supplied in the request):

1. **Client name** — the client receiving the release. No default.
2. **CCN number** — change-control number, format `DSD-NNNN` (or another house format if the workspace already uses one). If a `docs/ccn/` folder contains a relevant CCN, propose it.
3. **Issue number** — ticket / issue reference. No default.
4. **Prepared by** — full name of the person preparing the document. No default; never invent.

Optionally, link the release note to an existing artefact in the workspace:

- A spec under `openspec/specs/` (preferred — drives the **Scope of Change** section).
- A CCN under `docs/ccn/`.
- A merged feature branch (drives **Change Request Details** via git log).

If the user references a `SPEC-NNN` or `CCN-NNN`, read the file and reuse its title and module as defaults for the release note title / module.

### Step 2 — Allocate the next RN ID

1. List files in `docs/releasenotesmd/` matching `RN-*.releasenote.md` and any `*.releasenote.md` with an `RN-NNN` id in the frontmatter.
2. Parse the highest existing numeric ID and increment by 1; format as `RN-NNN` (zero-padded to 3 digits).
3. If the folder does not exist or is empty, start at `RN-001`.

### Step 3 — Read workspace context

This step is **mandatory** — never invent identity fields.

1. Read `app.json` and capture:
   - `version` → release-note `version` (e.g. `1.0.0.0`).
   - `name` → default for the release-note `title` when the user has no explicit title.
   - `publisher` → default for `releasedBy`.
   - `application`, `runtime` → drive **Testing Setup** (BC version requirements).
   - `dependencies` → drive **Testing Setup** (prerequisite extensions).
   - `idRanges` → only for cross-referencing object IDs already used.
2. If `app.json` is missing or any of the above keys are absent, **stop** and ask the user via `vscode_askQuestions` rather than guessing.
3. Inventory the AL objects that ship with this release. Use `file_search` with `src/**/*.al`. For each file, read the first ~50 lines to extract:
   - Object declaration (type + ID + name).
   - `Caption` property (user-facing functional name).
   - `PageType` for pages.
   - `TableType` for tables (e.g. `CDS`, `Temporary`).
   - `ToolTip` properties on fields (used in **Testing Steps**).
   - XML doc comments (`/// <summary>`) on codeunits.
4. Optionally check `git log --oneline -20 -- "src/**/*.al"` for the most recent AL-related commits and use them in **Change Request Details**.

If the codebase is large, delegate this inventory step to the `Explore` subagent with thoroughness `medium`.

### Step 4 — Resolve testing context

For each non-trivial page, table, or codeunit discovered in Step 3, decide what a reviewer must do to verify it works. Group the steps by object type:

- Permission set assignment.
- New / changed pages — open, verify visible fields and their ToolTips, create one record.
- New / changed page extensions — verify added group/fields.
- New / changed codeunits — describe the triggering scenario.
- New / changed reports, queries, XMLPorts — verify the output format.

If any object lacks a `Caption` or `ToolTip`, do not fabricate one — instead, list the object by its technical name and add an Open Item under **Known Limitations**.

### Step 5 — Blind spot review

Before drafting, surface to the user via `vscode_askQuestions` any of the following that apply:

1. **Missing data migration / upgrade codeunit** — if the release adds a new required field on an existing table without a default, ask whether an upgrade procedure is in scope.
2. **Missing permission set** — if a new table is added with no `PermissionSet` granting `Create / Modify / Delete`, ask whether permissions are in scope for this release.
3. **Missing translation** — if `translations/*.xlf` files do not contain entries for new captions/tooltips, flag it.
4. **Breaking change** — if any existing object signature changed (field renamed/removed, page action renamed), flag as a breaking change and require the user to confirm whether downstream consumers were notified.
5. **Untested dependency** — if `app.json` declares a new dependency, ask whether that dependency is available in the target tenant.

For every flagged item, offer three dispositions:

- **Add to Change Request Details** — visible to the client.
- **Add to Known Limitations** — visible to the client as a caveat.
- **Out of scope for this release** — recorded internally only; not surfaced to the client.

Do not proceed to Step 6 until every blind spot has a disposition.

### Step 6 — Draft and write the release note

Build the filename: `RN-NNN-<kebab-title>.releasenote.md`.

- `<kebab-title>` is the lowercase, hyphen-separated title (diacritics stripped, non-alphanumerics removed, collapsed hyphens).
- Validate against `^RN-\d{3}-[a-z0-9]+(-[a-z0-9]+)*\.releasenote\.md$` before writing.

Write the file at `docs/releasenotesmd/<filename>` using the template in `references/release-note-template.md`. The file MUST contain, in this exact order:

1. YAML frontmatter:
   ```yaml
   ---
   id: RN-NNN
   title: <Title>
   version: <from app.json>
   status: draft
   clientName: <from user>
   ccnNumber: <from user>
   issueNumber: <from user>
   releaseDate: <YYYY-MM-DD>
   releasedBy: <from app.json publisher>
   prepared_by: <author name>
   module: <module from spec or CCN>
   createdDate: <YYYY-MM-DD>
   approvedDate: ""
   ---
   ```
2. `# RN-NNN – <Title>` H1.
3. `## 1. Release Summary` — 2–4 sentence overview of what this release delivers and who is affected.
4. `## 2. Scope of Change` — bullet list grouped by object type (Tables, Table Extensions, Pages, Page Extensions, Codeunits, Permission Sets, Reports, etc.), each line of the form `Object Type ID "Object Name" — Caption-based functional description`.
5. `## 3. Change Request Details` — paragraph form, references the source CCN / SPEC / Issue. Includes a "Recent commits" subsection only if git history was used.
6. `## 4. Testing Setup` — prerequisites table (BC runtime, application version, dependencies, permission sets, master data preconditions).
7. `## 5. Testing Steps` — numbered checklist generated in Step 4, one section per area (Permissions / Pages / Page Extensions / Codeunits / Integrations).
8. `## 6. Known Limitations` — bullet list. Use the literal word "None" if there are no limitations.
9. `## 7. Approvals` — table with columns `Role | Name | Decision | Date | Signature`. Leave the rows empty (signature is collected after delivery).

Every H2 in the generated markdown MUST be immediately followed by `<!-- section-key: <CanonicalKey> -->` on its own line — see `references/release-note-fields.json` for the canonical keys.

### Step 7 — Emit the sibling JSON map

Alongside the markdown, write `RN-NNN-<kebab-title>.releasenote.json` with the shape:

```json
{
  "artifactType": "RELEASENOTE",
  "id": "RN-NNN",
  "language": "<bcp47-primary-subtag>",
  "frontmatter": { "<yamlKey>": "<value>", ... },
  "sections":    { "<CanonicalKey>": "<markdown body>", ... }
}
```

- **Keys** (both in `frontmatter` and in `sections`) MUST come **verbatim** from `references/release-note-fields.json` (`frontmatterFields[].key` and `sections[].key`).
- **Values** carry the content in the chosen target language.
- The JSON file is the canonical binding for `md-to-docx-converter` template placeholders — failure to emit it is a hard failure of the skill.

### Step 8 — Validate completeness

Run through the validation checklist before reporting success. Every entry below MUST be populated and non-placeholder:

```
✅ id                    : RN-NNN
✅ title                 : non-empty, no "[…]" placeholder
✅ version               : valid x.y.z(.w)
✅ status                : "draft"
✅ clientName            : non-empty
✅ ccnNumber             : matches DSD-NNNN (or workspace convention)
✅ issueNumber           : non-empty
✅ releaseDate           : YYYY-MM-DD
✅ releasedBy            : non-empty (from app.json publisher, not a hardcoded company)
✅ module                : non-empty
✅ createdDate           : YYYY-MM-DD
✅ Release Summary       : ≥ 1 paragraph
✅ Scope of Change       : ≥ 1 bullet
✅ Change Request Details: ≥ 1 paragraph
✅ Testing Setup         : ≥ 1 row
✅ Testing Steps         : ≥ 1 numbered step
✅ Known Limitations     : "None" or ≥ 1 bullet
✅ Approvals             : table header present
```

If **any** check fails, prompt the user for the missing information and re-run the validation. Do not write the JSON file until validation passes.

### Step 9 — Report completion

After both files are written, report to the user:

- Path of the created markdown file (as a markdown link).
- Path of the sibling JSON file (as a markdown link).
- The allocated `RN-NNN` id and the workspace version used.
- The detected `releasedBy` (from `app.json` publisher) and the source spec / CCN if linked.
- A 1-line summary of each section.
- Any items recorded under **Known Limitations**.
- The next recommended action — typically: review the markdown, set `status: approved` in the frontmatter, then run the `md-to-docx-converter` skill to produce the Word deliverable.

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
- **approvedDate MUST be empty** on initial creation.
- **The `prepared_by` frontmatter field is mandatory.** It must contain the full name of the human user — never an agent role or agent name. If the author name is not evident from context (git user, previous artefacts, or explicit user input), ask the user before writing the file.
- **Never** hardcode a company name, client name, or publisher anywhere in the template, field map, or generated output — `releasedBy` comes from `app.json` (`publisher`) or the user.
- **Never** invent or guess `clientName`, `ccnNumber`, or `issueNumber` — they MUST come from the user.
- **Never** invent AL object IDs or names — they MUST come from the actual files in `src/`.
- **Never** overwrite an existing release note. On collision, re-allocate the RN ID or pick a non-colliding slug.
- The sibling `.releasenote.json` file is **mandatory** — failure to emit it is a hard failure of the skill.
- Every H2 in the markdown MUST be followed by its `<!-- section-key: ... -->` anchor.
- The Approvals table header MUST be present even when empty.
- If `app.json` is missing or incomplete, **stop** and ask — do not fabricate version or publisher.

## References

- `references/release-note-fields.json` — canonical, language-neutral static field/section keys used to drive the mandatory JSON output and any downstream `md-to-docx-converter` template.
- `references/release-note-template.md` — full markdown skeleton with section headings, anchors, and `{{Placeholder}}` tokens.

## Integration with other skills

- **Upstream**: `documentation-bc-ccn-generator` (a CCN can be referenced by `ccnNumber`), `documentation-bc-technical-spec-generator` (a spec can drive the Scope of Change).
- **Downstream**: `md-to-docx-converter` consumes the sibling `*.releasenote.json` to populate a Word template (template hint: `7_ReleaseNote_Template`).

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