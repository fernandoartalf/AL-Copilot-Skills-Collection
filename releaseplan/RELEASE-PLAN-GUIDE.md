# Release Plan Guide

This document explains the structure and purpose of the monthly `plan.md` files used to track proposed AL Copilot Skills for the **AL-Copilot-Skills-Collection** repository.

---

## Folder Structure

```
releaseplan/
  RELEASE-PLAN-GUIDE.md      ← This guide
  TEMPLATE.md                 ← Blank template for reference
  2026/
    04-april.md               ← One file per month
    05-may.md
    ...
    12-december.md
  2027/
    01-january.md
    ...
    12-december.md
```

Each year has its own folder. Inside, there is **one markdown file per month** named with a two-digit prefix for sorting (e.g. `04-april.md`).

---

## Alignment with Business Central Cumulative Updates

Monthly plans follow the **Business Central cumulative update (CU) cadence**. Microsoft ships two major releases (waves) per year:

| Wave | GA Month | Typical Version | CU Cycle |
|---|---|---|---|
| **Wave 1** | April | Even major version | CU0 (April) → CU5 (September) |
| **Wave 2** | October | Odd major version | CU0 (October) → CU5 (March next year) |

Each monthly plan file header indicates the corresponding BC wave and CU number so contributors can target a specific platform version if needed.

### Version Reference

| Year | Wave | BC Version | Months |
|---|---|---|---|
| 2026 | Wave 1 | v28.x | April – September 2026 |
| 2026 | Wave 2 | v29.x | October 2026 – March 2027 |
| 2027 | Wave 1 | v30.x | April – September 2027 |
| 2027 | Wave 2 | v31.x | October – December 2027 |

---

## How a Monthly plan.md File Is Structured

Each file contains:

1. **Header** — Month, year, BC wave, and CU alignment.
2. **Overview** — Brief description of the contribution cycle.
3. **Proposed Skills** — One entry per skill proposal containing:
   - **Skill Name** — The folder name for the skill (e.g. `bc-setup-wizard-generator`).
   - **Short Description** — One-to-two sentence summary.
   - **Target BC Version** _(optional)_ — The BC version the skill targets.
   - **Status** — Current state (🟡 Proposed · 🟢 Approved · 🔵 In Development · ✅ Merged).
   - **Author** — Full Name, GitHub User, GitHub Profile, LinkedIn Profile.
   - **Co-Authors** _(optional)_ — Same fields as Author, repeated per co-author.
   - **Motivation** — Why the skill is needed and what problem it solves.
4. **Contribution Workflow** — Step-by-step instructions for contributors.
5. **Summary Table** — Quick-glance table of all skills and their status.

See [TEMPLATE.md](TEMPLATE.md) for the full blank template.

---

## Contribution Workflow

1. **Fork** the repository and create a branch from `main`.
2. **Add your skill entry** to the `plan.md` file for the month you are targeting.
3. **Open a Pull Request** targeting `main` for plan approval.
4. **Wait for approval** from the repository maintainer (@fernandoartalf).
5. **Develop the skill** following the [skill creation instructions](../instructions/skills-creation.instructions.md).
6. **Submit the completed skill** via a new Pull Request targeting `main`.

### Status Lifecycle

```
🟡 Proposed  →  🟢 Approved  →  🔵 In Development  →  ✅ Merged
     │               │                                      │
     └─ PR opened    └─ Maintainer approves PR              └─ Skill PR merged to main
```

---

## Guidelines for Contributors

- **One entry per skill.** If you are proposing multiple skills, add a separate block for each.
- **Pick the right month.** Target the month when you plan to have the skill ready for review.
- **Keep descriptions concise.** The plan is meant for quick review, not full documentation.
- **Do not modify other contributors' entries** unless you are listed as a co-author.
- **Use the template.** Copy the skill entry block from the plan file or from [TEMPLATE.md](TEMPLATE.md).
