# Anti-Patterns Catalogue

Known failure modes in BC agent instructions, their observable signatures, root causes, and standard fixes.

## Table of contents

1. [MEMORIZE violations](#1-memorize-violations)
2. [Page and field name mismatches](#2-page-and-field-name-mismatches)
3. [Guideline structural problems](#3-guideline-structural-problems)
4. [Missing or malformed HITL gates](#4-missing-or-malformed-hitl-gates)
5. [Task structure problems](#5-task-structure-problems)
6. [Reply format problems](#6-reply-format-problems)
7. [Navigation problems](#7-navigation-problems)
8. [Error handling problems](#8-error-handling-problems)
9. [Responsibility section problems](#9-responsibility-section-problems)
10. [Action invocation problems](#10-action-invocation-problems)

---

## 1. MEMORIZE violations

### 1.1 MEMORIZE placed after use

**Signature:** A step reads a field and a later step references the value, but `**Memorize**` appears *after* the step that needs it — or not at all.

**What the runtime does:** The agent navigates away from the page where the value was read. On the new page, the value is gone. The agent either substitutes a blank, uses a stale value from a previous run, or asks for assistance.

**Standard fix:** Move `**Memorize**` to the same sub-step as the `Read` call, immediately after the value is obtained. Always include an example format.

```
2b. Read "Credit Limit (LCY)" field
2c. **Memorize**: "Customer: {No.} | Limit: {Credit Limit (LCY)} | Balance: {Balance (LCY)}"
```

---

### 1.2 MEMORIZE without example format

**Signature:** `**Memorize**` is present but has no example showing the key-value structure.

**What the runtime does:** The agent stores an unstructured blob. When it needs to extract a specific value later, it may misparse it, especially if the value contains numbers, dates, or special characters.

**Standard fix:** Always append a pipe-separated key-value example.

```
**Memorize**: "Order: {No.} | Customer: {Sell-to Customer No.} | Amount: {Amount Including VAT}"
```

---

### 1.3 Over-memorizing

**Signature:** Every field on every page is Memorized, resulting in a Memorize block with 10+ entries.

**What the runtime does:** Works but performs poorly. The agent's working context fills up faster, increasing the likelihood of truncation errors in long tasks.

**Standard fix:** Memorize only values that will be referenced in a later step on a different page. Values used immediately on the same page do not need Memorizing.

---

## 2. Page and field name mismatches

### 2.1 Vague or abbreviated page name

**Signature:** Instructions say `Navigate to "Sales Orders"` but the agent's profile page is named `"Sales Order List"`.

**What the runtime does:** The agent cannot resolve the navigation. It may open the wrong page, open the role center, or ask for assistance.

**Standard fix:** Copy the exact page caption from the agent's profile customization. If the exact name is unknown, flag it for the user to verify.

---

### 2.2 Field name not matching page customization

**Signature:** Instructions reference `"Credit Available"` but the field is captioned `"Credit Limit (LCY)"` on the page.

**What the runtime does:** The agent cannot locate the field. It may skip the step, read a different field, or ask for assistance.

**Standard fix:** Use the exact field caption as it appears on the page in the agent's profile. Remind the user: the agent sees only what is visible in its customized profile view.

---

### 2.3 Action name not matching page action caption

**Signature:** Instructions say `Invoke action "Post"` but the action is captioned `"Post and Send"` on the page.

**What the runtime does:** The agent cannot find the action. It may do nothing, attempt the wrong action, or ask for assistance.

**Standard fix:** Verify the exact action caption from the page. When in doubt, flag it.

---

### 2.4 Reference to "Tell Me"

**Signature:** Instructions say something like "search for X using the search function" or "use Tell Me to find page Y".

**What the runtime does:** Agents cannot use Tell Me. The instruction is silently ignored or causes the agent to ask for assistance.

**Standard fix:** Replace every Tell Me reference with an explicit `Navigate to "{Page Name}"` using the page's exact name from the agent's profile.

---

## 3. Guideline structural problems

### 3.1 Too many guidelines (>7)

**Signature:** The `**GUIDELINES**:` section has 8 or more bullet rules.

**What the runtime does:** Works but produces inconsistent behaviour. The agent applies some guidelines and ignores others, seemingly at random, because its attention is distributed too thinly.

**Standard fix:** Consolidate to 3–7 rules. Merge related rules (e.g., two "DO NOT post" rules can become one). Move task-specific constraints into the relevant `## Task:` section.

---

### 3.2 Contradictory guidelines

**Signature:** One guideline says `ALWAYS confirm before sending` and another says `DO NOT ask for confirmation on outgoing messages`.

**What the runtime does:** Unpredictable. The agent resolves the contradiction differently on each run.

**Standard fix:** Remove or rewrite one of the contradictory rules. Decide which takes priority and state it once, clearly.

---

### 3.3 No ALWAYS or DO NOT keywords

**Signature:** Guidelines are written as plain sentences without `**ALWAYS**` or `**DO NOT**` emphasis.

**What the runtime does:** Treats the guidelines as suggestions rather than hard constraints. They are applied less consistently.

**Standard fix:** Prefix every guideline with `**ALWAYS**` (mandatory behaviour) or `**DO NOT**` (prohibited behaviour).

---

### 3.4 Guidelines not matching the Responsibility

**Signature:** The Responsibility says the agent handles credit checks, but no guideline mentions what to do when credit is exceeded.

**What the runtime does:** The agent improvises the missing constraint, sometimes correctly, sometimes not.

**Standard fix:** Audit guidelines against the Responsibility. Every core business rule implied by the Responsibility should have a corresponding guideline.

---

## 4. Missing or malformed HITL gates

### 4.1 Critical action without user intervention gate

**Signature:** The task instructs the agent to `Invoke action "Post"` or `Invoke action "Send"` or `Delete` without a preceding `Request user intervention` or `Request a review` step.

**What the runtime does:** The agent executes the irreversible action autonomously without human confirmation.

**Standard fix:** Add `Request user intervention with details: {reason}` or `Request a review` immediately before any posting, sending, releasing, or deleting action.

```
4. Request user intervention with details: "Ready to post order {No.} for {Amount}. Please confirm."
5. Invoke action "Post"
```

---

### 4.2 HITL gate with no detail

**Signature:** `Request user intervention` with no `with details:` clause.

**What the runtime does:** The agent pauses but gives the user no context for what decision is needed. The user may approve blindly or cancel unnecessarily.

**Standard fix:** Always include `with details:` followed by the key decision parameters.

---

## 5. Task structure problems

### 5.1 No ## Task: sections

**Signature:** The Instructions section has numbered steps but no `## Task:` headers to group them.

**What the runtime does:** The agent cannot distinguish between multiple task workflows. It may mix steps from different tasks or fail to select the right workflow for the user's input.

**Standard fix:** Wrap every distinct workflow in a `## Task: {Name}` header. Use distinct trigger keywords in Reply outputs to enable routing.

---

### 5.2 Steps without lettered sub-steps for complex operations

**Signature:** A single numbered step combines multiple distinct operations (navigate + read + memorize) without lettered sub-steps.

**What the runtime does:** Works, but the agent may execute the operations out of order or skip one if it judges them redundant.

**Standard fix:** Break compound steps into numbered step + lettered sub-steps.

```
3. Read customer context
   a. Read "No." field
   b. Read "Credit Limit (LCY)" field
   c. **Memorize**: "Customer: {No.} | Limit: {Credit Limit (LCY)}"
```

---

### 5.3 Conditional branches not explicit

**Signature:** Steps say things like "check if the value is high" without defining what "high" means or what to do in each branch.

**What the runtime does:** The agent invents a threshold or a branch outcome. Results are non-deterministic.

**Standard fix:** Make every condition explicit with both branches.

```
4. If "Credit Limit (LCY)" - "Balance (LCY)" < Order Amount:
   a. Request user intervention with details: "Credit available: {available}. Order: {amount}."
5. If credit is sufficient:
   a. Continue to step 6
```

---

## 6. Reply format problems

### 6.1 No Reply in task

**Signature:** A task has no `**Reply**:` step.

**What the runtime does:** The agent completes the task silently. The user sees no output and may not know the task finished.

**Standard fix:** Add a `**Reply**` step at the end of every task with a structured format.

---

### 6.2 Reply with no structured keywords

**Signature:** `**Reply**` outputs a natural language sentence rather than a pipe-separated structure.

**What the runtime does:** Works for human reading but cannot be parsed programmatically. If another agent or a downstream system needs to parse the output, it will fail.

**Standard fix:** Use consistent keyword patterns in Reply outputs.

```
**Reply**: "credit check complete | Order: {No.} | Customer: {Customer} | Status: APPROVED | Available: {Available}"
```

---

### 6.3 Reply keywords inconsistent across tasks

**Signature:** Task A replies with `"status: OK"` and Task B replies with `"result: success"` for conceptually equivalent outcomes.

**What the runtime does:** Works but makes downstream routing and parsing fragile.

**Standard fix:** Define a consistent keyword vocabulary in guidelines and use it across all tasks.

---

## 7. Navigation problems

### 7.1 Navigate to page not in agent profile

**Signature:** Instructions navigate to a page that is not in the list of pages the agent's profile includes.

**What the runtime does:** The agent cannot open the page. It asks for assistance or fails silently.

**Standard fix:** Verify every page referenced in navigation against the agent's profile page list. Remove navigation to pages not in the profile, or ask the user to add the page to the profile.

---

### 7.2 Missing return navigation after sub-page lookup

**Signature:** The agent navigates to a secondary page for a lookup (e.g., Customer Card), reads a value, but no instruction tells it to return to the original page.

**What the runtime does:** The agent stays on the secondary page. Subsequent steps that reference the original page's fields will fail or read from the wrong record.

**Standard fix:** Add an explicit return navigation step after the lookup.

```
6. Navigate back to Sales Order Card for order {No.}
```

---

## 8. Error handling problems

### 8.1 No error handling section

**Signature:** A task has steps but no "Error Handling" or equivalent section at the end.

**What the runtime does:** When anything unexpected happens (record not found, page unavailable, action fails), the agent either loops, asks for assistance with no context, or produces a confusing Reply.

**Standard fix:** Add an Error Handling section at the end of each task covering at minimum: record not found, page unavailable, action failed.

```
## Error Handling
- If order not found: **Reply**: "task failed | Order not found: {No.}"
- If action unavailable: **Reply**: "WARNING | Action not available. Manual action required."
```

---

### 8.2 Error handling with no Reply

**Signature:** Error handling says "stop" or "exit" without a Reply.

**What the runtime does:** The agent stops silently. The user does not know what happened.

**Standard fix:** Every error path must end with a `**Reply**` that includes the error condition and the record reference.

---

## 9. Responsibility section problems

### 9.1 Responsibility is multiple sentences

**Signature:** The `**RESPONSIBILITY**:` section contains two or more sentences.

**What the runtime does:** The agent anchors on the first sentence and may ignore the scope defined in the second. The effective responsibility is narrower than intended.

**Standard fix:** Rewrite as a single sentence that captures the full business outcome.

---

### 9.2 Responsibility uses technical language

**Signature:** Responsibility says "process API calls to the Customer table" instead of "validate customer credit before order release".

**What the runtime does:** Works, but the agent's self-model is technical rather than business-oriented. This makes guideline interpretation less reliable in edge cases.

**Standard fix:** Write the Responsibility in business terms: what business outcome is the agent accountable for?

---

## 10. Action invocation problems

### 10.1 Action invoked before prerequisite state

**Signature:** `Invoke action "Post"` is called without a preceding step that confirms the record is in the required state (e.g., Status = Released).

**What the runtime does:** The action fails at runtime because the document is not in the right state. The agent may loop trying to invoke the same action, or escalate to assistance.

**Standard fix:** Add an explicit state check before the action.

```
3. Read "Status" field
4. If Status ≠ Released:
   a. Request user intervention with details: "Cannot post: order {No.} is not released."
5. Invoke action "Post"
```

---

### 10.2 Confirmation dialog not handled

**Signature:** An action is invoked that produces a confirmation dialog, but no `Confirm the action when prompted` step follows.

**What the runtime does:** The agent may hang waiting for the dialog, dismiss it unintentionally, or ask for assistance.

**Standard fix:** Add `Confirm the action when prompted` immediately after any action known to produce a confirmation dialog.

---

### 10.3 Hard-coded environment values in instructions

**Signature:** Instructions reference specific company names, user IDs, or URLs directly (e.g., `Search for "CRONUS International" in "Company"`).

**What the runtime does:** Works in the specific environment where the instructions were written, fails in any other environment.

**Standard fix:** Replace hard-coded values with variables from Memorize or from setup tables. If the value must be hard-coded, flag it clearly so the user knows to update it per environment.
