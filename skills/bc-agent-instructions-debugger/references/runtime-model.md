# BC Agent Runtime — Mental Model

Reference for simulating agent execution during diagnosis. Use this to reason about what the runtime actually does at each step of the instructions.

---

## Core memory model

The agent has two distinct memory types:

| Memory type | What it holds | Persistence |
|---|---|---|
| **Action history** | Every action taken in the current session | Full session |
| **Memorized values** | Key-value pairs explicitly stored with `**Memorize**` | Full session |
| **Page state** | Fields visible on the current page | Current page only — lost on navigation |
| **List search results** | Results of searches on list pages | Full session |

**Critical implication:** When the agent navigates away from a page, all field values on that page become inaccessible — unless they were explicitly **Memorized** before navigation. This is the single most common source of bugs.

---

## Navigation model

The agent can only navigate to pages that are:

1. Explicitly listed in its profile's page customizations, OR
2. Reachable from the role center via a direct link

The agent **cannot**:
- Use "Tell Me" search
- Open pages via keyboard shortcuts
- Navigate via browser-style back/forward
- Open pages that are not in its profile

When instructions say `Navigate to "{Page Name}"`, the runtime resolves the name against the profile. If the name does not match exactly (including case and punctuation), resolution fails.

---

## Keyword contract

The following keywords activate specific runtime tools. The runtime responds to these exactly as described. Anything not in this list is interpreted as natural language guidance — it may or may not be followed consistently.

| Keyword | Tool activated | Notes |
|---|---|---|
| `Navigate to "{Page Name}"` | Page navigation | Page name must match profile exactly |
| `Open "{Card Page Name}"` | Card page navigation | Same constraint |
| `Search for {value} in "{Field}"` | List filter | Applies a filter on the current list page |
| `Find the target {entity} by "{Field}"` | Record lookup | Searches for a record by field value |
| `Set field "{Field Name}" to {value}` | Field setter | Field must be editable on the current page |
| `Use lookup` | Lookup trigger | Opens lookup on the currently focused field |
| `Read "{Field Name}"` | Value retrieval | Returns the current value of a field |
| `**Memorize**` | State retention | Stores key-value pairs for later steps |
| `Invoke action "{Action Name}"` | Action invocation | Action name must match caption exactly |
| `Confirm the action when prompted` | Dialog handler | Handles confirmation dialogs |
| `**Reply**` | Message output | Sends a response to the user |
| `Write an email` | Email composition | Drafts email — requires user review |
| `Add comment` | Comment line | Adds a comment to the current record |
| `Request user intervention with details: {reason}` | HITL pause | Pauses agent, presents reason to user |
| `Request a review` | Review gate | User must confirm before agent continues |
| `Ask for assistance` | Help escalation | Agent requests help when stuck |

---

## Execution flow per task

When the user sends a task message, the runtime:

1. Reads the full instruction file
2. Selects the `## Task:` section whose description best matches the user's message
3. Executes steps sequentially, top to bottom
4. Maintains action history throughout
5. On `**Reply**`: sends the message and considers the task complete

If no `## Task:` sections exist, the runtime attempts to execute all steps as a single unnamed task.

---

## Guidelines enforcement

Guidelines are evaluated continuously throughout execution, not only at specific steps. This means:

- A guideline saying `ALWAYS request review before posting` applies every time the agent is about to post, regardless of which task it is in
- A guideline saying `DO NOT modify Customer records` applies even if a task step seems to imply modification

**Conflict resolution:** When a task step conflicts with a guideline, the guideline typically wins. If two guidelines conflict, the result is non-deterministic.

**Attention limits:** The runtime's ability to consistently enforce all guidelines degrades as the number of guidelines increases. Beyond 7 guidelines, enforcement becomes inconsistent.

---

## HITL gate semantics

`Request user intervention` pauses execution and waits for the user to respond. The runtime resumes after the user's response and continues from the next step.

`Request a review` is similar but framed as a quality checkpoint rather than a decision point. The user confirms and the agent continues.

Neither gate automatically prevents the subsequent action — the agent proceeds to the next step regardless of what the user says, unless the instructions explicitly branch based on user response.

---

## Reply semantics

`**Reply**` sends a message to the user. After a Reply, the agent considers the current task complete. It does not continue to subsequent steps unless the user sends a follow-up message.

If a task has no Reply, the agent completes silently. The user sees no output.

---

## What the agent retains between sessions

Nothing. Each session starts with a clean state. Action history, memorized values, and page state from a previous session are not available.

Instruction files are the only persistent configuration. Everything the agent knows about its role, constraints, and procedures must be in the instruction file.

---

## Escalation behaviour

When the agent cannot proceed (page not found, action not available, field not found, condition not met with no branch defined), it escalates via `Ask for assistance`. The message it sends to the user reflects the last coherent step it could execute and the point of failure.

If the instructions have explicit error handling, the agent uses it. If not, the escalation message is generic and may not give the user enough context to help.

---

## Agent session detection

Event subscribers and background code may fire during agent sessions. Code that should not run during agent execution should guard with:

```al
if not AgentSession.IsAgentSession(Provider) then exit;
```

This is relevant when diagnosing unexpected side effects triggered by agent actions — the agent may invoke an action that fires an event subscriber with unintended consequences.
