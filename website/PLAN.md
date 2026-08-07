# AL Copilot Skills Collection Site — Development Plan

> This plan is designed to be executed iteratively with the help of the custom Copilot agents and instructions defined in this project.

---

## Phase 0 — Project Bootstrap

**Goal:** Scaffold the Docusaurus site and confirm it runs locally.

| Step | Task | Agent / Tool |
|------|------|-------------|
| 0.1 | Initialize Docusaurus project (`npx create-docusaurus@latest`) in the repo root | `docusaurus-dev` agent |
| 0.2 | Configure `docusaurus.config.ts` — title, tagline, URL, `baseUrl`, GitHub link, navbar, footer | `docusaurus-dev` agent |
| 0.3 | Configure `sidebars.ts` with categories: Getting Started, Skills, Agents, Contributing | `docusaurus-dev` agent |
| 0.4 | Verify local dev server (`npm start`) renders correctly | Terminal |
| 0.5 | Commit initial scaffold to `main` | Git |

**Deliverable:** Running Docusaurus site at `localhost:3000` with default content.

---

## Phase 1 — Custom Agents & Instructions

**Goal:** Create the Copilot customization files so all subsequent phases benefit from AI assistance tuned to this project.

| Step | Task | Details |
|------|------|---------|
| 1.1 | Create `.github/agents/docusaurus-dev.agent.md` | Docusaurus specialist — config, plugins, React components, deployment |
| 1.2 | Create `.github/agents/content-manager.agent.md` | Content specialist — skill docs, front-matter, sidebar ordering, MDX |
| 1.3 | Create `.github/instructions/docusaurus.instructions.md` | `applyTo` Docusaurus config and `src/**` files |
| 1.4 | Create `.github/instructions/content-authoring.instructions.md` | `applyTo` all `docs/**/*.md` files |
| 1.5 | Test that agents and instructions load in VS Code Copilot Chat | Manual verification |

**Deliverable:** Four customization files committed; Copilot responds with project-aware suggestions.

---

## Phase 2 — Content Structure & Landing Page

**Goal:** Replace default content with the AL Copilot Skills Collection identity and navigation.

| Step | Task | Agent / Tool |
|------|------|-------------|
| 2.1 | Write `docs/intro.md` — project introduction, what are skills, quick-start | `content-manager` agent |
| 2.2 | Write `docs/installation.md` — how to install skills in VS Code | `content-manager` agent |
| 2.3 | Write `docs/contributing.md` — contribution guide | `content-manager` agent |
| 2.4 | Design `src/pages/index.tsx` homepage — hero section, feature cards, CTA | `docusaurus-dev` agent |
| 2.5 | Add logo and social card to `static/img/` | Manual / design tool |
| 2.6 | Update sidebar to reflect new docs | `docusaurus-dev` agent |

**Deliverable:** Branded homepage and core documentation pages.

---

## Phase 3 — Skill Content Import

**Goal:** Bring in the actual skill markdown files from the upstream repo.

| Step | Task | Agent / Tool |
|------|------|-------------|
| 3.1 | Define the canonical front-matter schema for skill pages (title, description, sidebar_position, tags) | `content-manager` agent |
| 3.2 | Manually copy or script-copy all `SKILL.md` files into `docs/skills/<skill-name>/` | Terminal / script |
| 3.3 | Add Docusaurus front-matter to each skill page | `content-manager` agent |
| 3.4 | Create `docs/skills/overview.md` — index page for the skills section | `content-manager` agent |
| 3.5 | Verify sidebar auto-generates or manually configure skill entries | `docusaurus-dev` agent |
| 3.6 | Review all skill pages render correctly in local dev | Terminal |

**Deliverable:** All skills browsable in the sidebar with correct rendering.

---

## Phase 4 — GitHub Actions CI/CD

**Goal:** Automate build, deploy, and content sync.

| Step | Task | Agent / Tool |
|------|------|-------------|
| 4.1 | Create `.github/workflows/deploy.yml` — build on push to `main`, deploy to `gh-pages` | `docusaurus-dev` agent |
| 4.2 | Create `.github/workflows/sync-skills.yml` — fetch skills from upstream on release/dispatch | `docusaurus-dev` agent |
| 4.3 | Configure GitHub repo settings: Pages source → `gh-pages` branch, custom domain (optional) | Manual (GitHub UI) |
| 4.4 | Test end-to-end: push → build → deploy → live site | Terminal / browser |

**Deliverable:** Site auto-deploys on push; skills sync on upstream release.

---

## Phase 5 — Polish & Launch

**Goal:** Final QA, SEO, and public announcement.

| Step | Task | Agent / Tool |
|------|------|-------------|
| 5.1 | Add search plugin (Algolia DocSearch or local search) | `docusaurus-dev` agent |
| 5.2 | Add SEO metadata (`<meta>` tags, Open Graph, sitemap) | `docusaurus-dev` agent |
| 5.3 | Mobile responsiveness check | Browser |
| 5.4 | Write `README.md` with badges, quick links, and contributor info | `content-manager` agent |
| 5.5 | Create first GitHub Release for the site | Manual |
| 5.6 | Announce on social / community channels | Manual |

**Deliverable:** Production-ready, publicly accessible documentation site.

---

## Iteration Workflow

After the initial setup, the day-to-day workflow looks like this:

```
1. Open VS Code in this workspace
2. Invoke @docusaurus-dev or @content-manager in Copilot Chat
3. Describe what you need (new page, config change, fix, etc.)
4. The agent uses project instructions to produce context-aware output
5. Review, accept, and commit
6. Push → auto-deploy
```

---

## Phase Dependency Graph

```
Phase 0 (Bootstrap)
    │
    ├──► Phase 1 (Agents & Instructions)
    │        │
    │        ├──► Phase 2 (Content & Landing Page)
    │        │        │
    │        │        └──► Phase 3 (Skill Import)
    │        │                 │
    │        │                 └──► Phase 5 (Polish & Launch)
    │        │
    │        └──► Phase 4 (CI/CD)
    │                 │
    │                 └──► Phase 5 (Polish & Launch)
```

---

## Next Action

**Start with Phase 0.1** — scaffold the Docusaurus project. Then proceed to Phase 1 to create the agents and instructions that will assist with all remaining phases.
