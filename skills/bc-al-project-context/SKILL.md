---
name: bc-al-project-context
description: "Maintains persistent project context for Business Central AL extensions across sessions, developers, and AI agents. Combines two complementary mechanisms: Architecture Decision Records (ADRs) that capture why technical decisions were made, and Session Handoff documents that capture where the project is right now. Generates, updates, and queries both document types. Use this skill whenever starting a new coding session on an existing project, ending a session and need to document progress, onboarding a new developer or AI agent to an existing codebase, explaining why a technical decision was made, wondering why something is designed a certain way, resuming work after a break, or handing off work between team members. Also trigger when the user says 'document this decision', 'why is this designed like this', 'where did we leave off', 'catch me up', 'what was decided', 'create an ADR', 'end of session', 'handoff', or 'context for next session'."
---

# BC AL Project Context

Maintains persistent project context for Business Central AL extensions. Solves the two most expensive context problems in AL development: **why** things are designed the way they are (Architecture Decision Records), and **where** the project is right now (Session Handoff).

Read `references/adr-format.md` **when creating or querying an ADR** (Modes 1 and 2) — it contains the template, status values, and three complete BC AL examples.
Read `references/handoff-format.md` **when creating or reading a Session Handoff** (Modes 3 and 4) — it contains the template and two complete examples including a handoff to an AI agent.

---

## The two mechanisms

| Mechanism | File location | Answers | Created when |
|---|---|---|---|
| **ADR** | `.github/decisions/ADR-NNN-title.md` | Why was this decided? | A significant technical decision is made |
| **Session Handoff** | `.github/context/handoff-YYYY-MM-DD.md` | Where are we right now? | Ending a session or handing off to someone else |

Both mechanisms are **file-based** — they live in the repository alongside the code, are version-controlled, and are readable by any developer or AI agent without special tools.

---

## When to create an ADR

Create an ADR when a decision:
- Affects the overall architecture of the extension (not a local implementation choice)
- Will be hard to reverse or expensive to change later
- Could be misunderstood by a future developer or AI agent
- Involves a tradeoff where the rejected alternatives matter
- Contradicts a common pattern or best practice (and there's a good reason)

**Do NOT create an ADR for:**
- Routine implementation choices (which variable name, which loop structure)
- Decisions that are obviously correct given the context
- Decisions that can be changed cheaply at any time

**Rule of thumb:** If a future developer looking at the code would ask "why did they do it this way?", that's an ADR.

---

## When to create a Session Handoff

Create a Session Handoff:
- At the end of every significant work session (>1 hour of work)
- Before handing off to another developer
- Before handing off to an AI agent (Claude Code, GitHub Copilot)
- When pausing work that will resume in a different context
- When a sprint or milestone ends

---

## Execution workflow

### Mode 1 — Create ADR

**Trigger phrases:** "document this decision", "create an ADR", "why did we choose X", "record this"

1. Ask the user to describe the decision if not already clear:
   - What was decided?
   - What alternatives were considered?
   - Why was this option chosen over the others?
   - What are the known consequences or tradeoffs?

2. Assign the next ADR number by checking existing files in `.github/decisions/`

3. Generate the ADR file using the template in `references/adr-format.md`

4. Confirm the file path and content with the user before saving

**Output:** `.github/decisions/ADR-{NNN}-{kebab-title}.md`

---

### Mode 2 — Query ADR

**Trigger phrases:** "why is this designed like this", "what was decided about X", "catch me up on decisions", "why do we use this pattern"

1. Search `.github/decisions/` for ADRs related to the topic
2. If found: summarize the decision, the alternatives considered, and the status
3. If not found: say so, and offer to create one if the decision is known

---

### Mode 3 — Create Session Handoff

**Trigger phrases:** "end of session", "handoff", "context for next session", "where did we leave off", "documenting progress"

1. Ask the user to confirm or provide:
   - What was accomplished in this session
   - What is in progress (started but not finished)
   - What is the immediate next action
   - Any open questions or blockers
   - Any decisions made (offer to create ADRs for significant ones)

2. Generate the Handoff document using the template in `references/handoff-format.md`

3. If the session produced significant decisions not yet captured as ADRs, prompt the user to create them before closing

**Output:** `.github/context/handoff-{YYYY-MM-DD}.md`
If multiple sessions in one day: `handoff-{YYYY-MM-DD}-{N}.md`

---

### Mode 4 — Read Session Handoff (Start of session)

**Trigger phrases:** "catch me up", "where did we leave off", "start of session", "what's the current state", "brief me"

1. Find the most recent handoff file in `.github/context/`
2. Summarize in this order:
   - **Immediate next action** (first, most important)
   - **What was in progress** (what to pick up)
   - **What was completed** (for orientation)
   - **Open questions or blockers** (what needs a decision)
   - **Relevant ADRs** (link to decisions that affect current work)
3. Ask: "Ready to continue from here, or do you want to update the context first?"

---

### Mode 5 — Generate Context Brief

**Trigger phrases:** "onboard this agent", "context for Copilot", "brief for new developer", "project summary"

Combines the most recent Handoff with a summary of all ADRs into a single onboarding document:

1. Read `.github/context/handoff-{most-recent}.md`
2. Read all `.github/decisions/ADR-*.md` and extract: title, decision, status
3. Generate a `CONTEXT.md` brief (not saved permanently — for immediate use)

Format:
```markdown
# Project Context Brief — {extension name}
Generated: {date}

## Current state
{from most recent handoff: immediate next action + in progress}

## Key decisions
{ADR number, title, one-line decision summary — most recent first}

## Open questions
{from handoffs: unresolved items}
```

---

## File structure

```
.github/
├── decisions/
│   ├── ADR-001-use-event-subscribers-not-base-modification.md
│   ├── ADR-002-posting-routine-level-1-only.md
│   └── ADR-003-separate-test-app-project.md
└── context/
    ├── handoff-2026-03-15.md
    ├── handoff-2026-03-18.md
    └── handoff-2026-04-09.md
```

Both directories should be committed to the repository. Add them to `.gitignore` only if the decisions and context are confidential — but typically they are valuable for the whole team.

---

## Behaviour rules

1. Never create an ADR retroactively to justify a bad decision. ADRs capture honest decisions including their known weaknesses.

2. ADR status must be kept current. When a decision is superseded by a later ADR, update the status of the old one to `Superseded by ADR-NNN`.

3. Session Handoffs are not meeting minutes. They are action-oriented: the immediate next action must always be the first thing stated.

4. If the user ends a session with significant uncommitted decisions, prompt to create ADRs before closing. Do not let decisions live only in chat history.

5. When reading a handoff to start a session, always state the **immediate next action first** — not the history. The developer/agent needs to know what to do, not what happened.

6. Keep ADR titles in kebab-case, descriptive, and short enough to be readable as a filename. `ADR-004-why-we-use-isolated-storage-for-secrets.md` is good. `ADR-004-decision.md` is not.

7. Do not create a handoff if nothing meaningful happened. A handoff with "worked on the code" is worse than no handoff.

---

## Reference files

- `references/adr-format.md` — ADR template, status values, and three complete examples
- `references/handoff-format.md` — Session Handoff template and two complete examples
