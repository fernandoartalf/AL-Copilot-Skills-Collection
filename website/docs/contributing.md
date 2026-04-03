---
title: Contributing Guide
description: How to contribute new skills and improvements to the collection
sidebar_position: 100
---

# Contributing to AL-Copilot-Skills-Collection

Thank you for your interest in contributing! This repository grows through community contributions — every new skill helps the entire Business Central developer ecosystem build better extensions with AI-assisted development.

---

## Code of Conduct

By participating in this project, you agree to abide by the [GitHub Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines). We are committed to providing a welcoming and inclusive experience for everyone.

Please:

- **Be respectful** — Treat all contributors with courtesy and professionalism.
- **Be constructive** — Provide helpful feedback and focus on improving the work.
- **Be collaborative** — Work together toward shared goals, not against each other.
- **Be patient** — Reviews take time. Maintainers are volunteers.

Unacceptable behavior includes harassment, trolling, personal attacks, and publishing others' private information. Report violations to the repository maintainer (@fernandoartalf).

---

## How to Contribute

### 1. Propose a Skill (Release Plan)

All new skills start as a proposal in the monthly release plan.

1. **Fork** the repository and create a branch from `main`.
2. **Pick a month** in the [`releaseplan/`](releaseplan/) folder that matches when you plan to deliver the skill.
3. **Add your skill entry** to that month's plan file using the template block already present in the file (or copy from [`releaseplan/TEMPLATE.md`](releaseplan/TEMPLATE.md)).
4. **Fill in the required fields**:
   - **Skill Name** — The folder name (e.g. `bc-workflow-generator`).
   - **Short Description** — One-to-two sentences on what the skill does.
   - **Author** — Full Name, GitHub User, GitHub Profile, LinkedIn Profile.
   - **Motivation** — Why it's needed and what problem it solves.
5. **Open a Pull Request** targeting `main` with the title: `[Plan] {skill-name} — {Month} {Year}`.
6. **Wait for approval** from the repository maintainer.

### 2. Develop the Skill

Once your plan is approved:

1. **Read the [skill creation guidelines](instructions/skills-creation.instructions.md)** — they cover structure, principles, and best practices.
2. **Create your skill folder** under `skills/{skill-name}/` with the required files:

   ```text
   skills/{skill-name}/
   ├── SKILL.md              ← Main instructions
   ├── AUTHORS.md            ← Author and co-author info
   ├── CHANGELOG.md          ← Version history
   └── references/           ← Supporting files
       └── ...
   ```

3. **Follow the AUTHORS.md format** used across the repository:

   ```markdown
   # Authors

   ## Primary Author

   - **Full Name**: {Your name}
   - **GitHub User**: {username}
   - **GitHub Profile**: https://github.com/{username}
   - **LinkedIn Profile**: {LinkedIn URL}

   ## Co-Authors

   - **Full Name**: {Co-author name}
   - **GitHub User**: {username}
   - **GitHub Profile**: https://github.com/{username}
   - **LinkedIn Profile**: {LinkedIn URL}
   ```

4. **Test your skill** with an AI agent to verify it produces correct, idiomatic AL code.

### 3. Submit the Skill

1. **Open a Pull Request** targeting `main` with the title: `[Skill] {skill-name}`.
2. **Include in the PR description**:
   - Link to the approved plan entry.
   - Brief summary of the skill's purpose.
   - How you tested it.
3. **Respond to review feedback** promptly.
4. Once merged, the plan entry status will be updated to ✅ Merged.

---

## Status Lifecycle

```
🟡 Proposed  →  🟢 Approved  →  🔵 In Development  →  ✅ Merged
     │               │                                      │
     └─ Plan PR      └─ Maintainer approves plan PR         └─ Skill PR merged to main
```

---

## Guidelines

### Do

- **One skill per folder** — each skill is self-contained.
- **Keep SKILL.md concise** — agents have limited context windows. Only add information the agent doesn't already know.
- **Use the references/ folder** for examples, templates, and large code samples.
- **Follow existing naming conventions** — skill folders use `bc-{domain}-generator` format.
- **Update the plan entry** status when you start development (🔵 In Development).

### Don't

- **Don't modify other contributors' skills** without being listed as a co-author.
- **Don't modify other contributors' plan entries** unless you are a co-author.
- **Don't include credentials, tokens, or sensitive data** in any file.
- **Don't submit skills without an approved plan** — the plan-first workflow ensures alignment and avoids duplicate effort.

---

## Pull Request Standards

- **One concern per PR** — don't mix a plan proposal with a skill submission.
- **Descriptive titles** — use the `[Plan]` or `[Skill]` prefix convention.
- **Clean commit history** — squash or rebase before submitting if needed.
- **Pass any automated checks** before requesting review.

---

## Reporting Issues

- **Bugs or problems with existing skills** — open a [GitHub Issue](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues).
- **Feature requests or ideas** — start a [GitHub Discussion](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions).
- **Security vulnerabilities** — see [SECURITY.md](SECURITY.md). Do **not** open a public issue.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping build better AL development tools for the Business Central community!
