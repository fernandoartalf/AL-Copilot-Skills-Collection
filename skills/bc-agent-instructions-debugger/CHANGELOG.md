# Changelog

All notable changes to the `bc-agent-instructions-debugger` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-09

### Added

- Initial skill creation
- Two operating modes: pre-publication audit (full static analysis) and targeted debug (symptom-first)
- Five-step execution workflow: parse → simulate → classify → report → corrected file
- Structured diagnosis report template with severity classification (🔴 Blocking / 🟡 Degradation / 🔵 Improvement)
- Skills Evidencing block mandatory in every report
- Behaviour rules: no hallucinated page/field names, minimal targeted fixes, confirm before corrected file
- `references/anti-patterns.md`: 10 categories, 28 known failure modes with observable signatures, root causes, and standard fixes:
  - MEMORIZE violations (placed after use, missing example format, over-memorizing)
  - Page and field name mismatches (vague names, field caption mismatches, action caption mismatches, Tell Me references)
  - Guideline structural problems (>7 guidelines, contradictions, missing ALWAYS/DO NOT, misalignment with Responsibility)
  - Missing or malformed HITL gates (critical action without gate, gate with no detail)
  - Task structure problems (no Task sections, compound steps without sub-steps, implicit conditionals)
  - Reply format problems (no Reply, unstructured Reply, inconsistent keywords across tasks)
  - Navigation problems (page not in profile, missing return navigation after sub-page lookup)
  - Error handling problems (no error handling section, error path with no Reply)
  - Responsibility section problems (multiple sentences, technical language)
  - Action invocation problems (action before prerequisite state, unhandled confirmation dialog, hard-coded environment values)
- `references/runtime-model.md`: BC agent runtime mental model covering:
  - Core memory model (action history, Memorized values, page state, list search results)
  - Navigation model and constraints (no Tell Me, profile-only pages)
  - Full keyword contract table (all runtime-activating keywords)
  - Execution flow per task
  - Guidelines enforcement and attention limits
  - HITL gate semantics
  - Reply semantics
  - Cross-session state (nothing retained)
  - Escalation behaviour
  - ExecutionContext guard pattern for event subscribers
