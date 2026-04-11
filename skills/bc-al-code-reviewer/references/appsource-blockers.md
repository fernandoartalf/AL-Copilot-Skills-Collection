# AppSource Blockers

Complete list of conditions that cause AppSource submission rejection or automated validation failure. All findings from this file are 🔴 Blocker regardless of how minor they appear.

**Reference:** [Microsoft AppSource Checklist](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-checklist-submission)

---

## AS-01 — Prefix or suffix not registered

**What:** The extension uses a prefix/suffix that has not been registered with Microsoft via the partner portal.

**How to check:** The prefix/suffix used in object names must appear in the partner's registered affixes. Unregistered prefixes cause rejection even if applied consistently.

**Fix:** Register the prefix at [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard) before submission. Then apply it consistently to all objects and fields.

**Reference:** [Reserved prefix/suffix](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-prefix-suffix-app-name)

---

## AS-02 — Access to base app non-public members

**What:** The extension calls procedures, accesses fields, or references objects in the base application that are not marked `Access = Public` or that have `ObsoleteState = Removed`.

**How to check:** Any reference to a base app member without `[External]` attribute or `Access = Public` is a potential blocker. References to `ObsoleteState = Removed` always fail.

**Fix:** Replace with the documented public API or raise a GitHub issue on [BCApps](https://github.com/microsoft/BCApps) if no public alternative exists.

**Reference:** [AL access modifiers](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-al-access-modifiers)

---

## AS-03 — Test app not in separate project

**What:** Test codeunits are in the same `.app` as the production code.

**How to check:** Any codeunit with `Subtype = Test` or `Subtype = TestRunner` must be in a separate app project with its own `app.json` that declares the production app as a dependency.

**Fix:** Create a `*.Test` app project. Move all test codeunits and test libraries there.

**Reference:** [AppSource submission requirements — Test](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-checklist-submission#test-requirements)

---

## AS-04 — logo missing from app.json

**What:** The `logo` field is absent from `app.json` or points to a non-existent file.

**How to check:** `app.json` must have `"logo": "path/to/logo.png"`. The file must exist in the project at that path. Recommended size: 240×240 pixels.

**Fix:** Add a 240×240 PNG logo and reference it in `app.json`.

---

## AS-05 — brief or description missing or too short

**What:** `app.json` is missing `brief` or `description`, or they are below minimum length.

- `brief`: 1–128 characters, plain text
- `description`: 1–2048 characters, used in AppSource listing

**Fix:** Add meaningful, non-generic descriptions. "BC Extension" is not acceptable.

---

## AS-06 — privacyStatementUrl missing or invalid

**What:** `app.json` must contain `privacyStatementUrl` pointing to a live, accessible URL with a privacy policy that covers the extension's data handling.

**Fix:** Add `"privacyStatementUrl": "https://yourcompany.com/privacy"` to `app.json`. The URL must return HTTP 200.

---

## AS-07 — helpBaseUrl missing or pointing to localhost

**What:** `helpBaseUrl` in `app.json` must point to a live documentation URL. `localhost`, `127.0.0.1`, or any non-public URL causes rejection.

**Fix:** `"helpBaseUrl": "https://yourcompany.com/docs/{0}/{1}/"` — the `{0}` and `{1}` placeholders are replaced by BC with locale and help topic.

**Reference:** [Configure Context-Sensitive Help](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-context-sensitive-help)

---

## AS-08 — TranslationFile feature not enabled

**What:** Extensions submitted to AppSource must support at least English. If the extension ships translated resources, `TranslationFile` must be in the `features` array of `app.json`.

**How to check:**
```json
{
  "features": ["TranslationFile"]
}
```

**Fix:** Add `"TranslationFile"` to `features` in `app.json` and ensure `.xlf` translation files are present for supported languages.

---

## AS-09 — ObsoleteState = Removed object still referenced

**What:** The code references an object (table, page, codeunit, field) that has `ObsoleteState = Removed` in the version of the base app being targeted.

**How to check:** Build against the target BC version. `AL0432` warnings (pending) and `AL0503` errors (removed) identify these.

**Fix:** Replace with the object's designated successor as documented in its `ObsoleteReason`.

---

## AS-10 — suppressWarnings pragma hiding CodeCop errors

**What:** `#pragma warning disable` without a specific rule number, or disabling a CodeCop rule without an inline justification comment.

```al
// ❌ Rejected
#pragma warning disable

// ❌ Also rejected — no justification
#pragma warning disable AA0007

// ✅ Acceptable — specific rule, inline justification
#pragma warning disable AA0007 // WITH required for compatibility with base app codeunit signature — tracked in #142
#pragma warning restore AA0007
```

**Fix:** Remove all blanket `#pragma warning disable`. For each remaining suppression, add a specific rule number and a justification comment.

---

## AS-11 — Dependencies pointing to non-published extensions

**What:** `app.json` declares a dependency on an extension that is not published to AppSource or not available in the target BC environment.

**How to check:** Every entry in `dependencies` must be an extension that is either:
- Published on AppSource, OR
- A Microsoft base app / system app

**Fix:** Remove unpublished dependencies or publish them to AppSource first.

---

## AS-12 — Hardcoded object IDs in RunObject or RunPageView

**What:** Using numeric object IDs directly in `RunObject`, `RunPageView`, or `RunPageMode` instead of referencing the object by name.

```al
// ❌ Wrong
RunObject = page 50100;

// ✅ Correct
RunObject = page "CTX Lead Card";
```

**Fix:** Replace all numeric ID references with named object references.

**Reference:** [CodeCop AA0076](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/codecop-aa0076)

---

## AS-13 — InherentPermissions / InherentEntitlements missing

**What:** All objects must declare `InherentPermissions` and `InherentEntitlements`. Missing declarations block SaaS deployment and AppSource submission.

**Most common pattern for codeunits:**
```al
codeunit 50100 "CTX Lead Management"
{
    InherentPermissions = X;
    InherentEntitlements = X;
```

**For tables and pages:** The minimum is `InherentEntitlements = X`. Permissions on data are handled by permission sets, not by `InherentPermissions` on the table object.

**Reference:** [PerTenantExtensionCop PTE0001](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/pertenantextensioncop-pte0001)

---

## AS-14 — Supported upgrade path not documented

**What:** If the extension has a previous version on AppSource, it must provide a data upgrade path. Extensions that cannot upgrade from the previous version will be rejected.

**How to check:** Is there a codeunit with `Subtype = Upgrade` that handles the transition from the previous version? Are upgrade tags set on fresh install?

**Fix:** Implement upgrade codeunit following the patterns in `bc-upgrade-codeunit-generator` skill.

---

## Quick validation checklist

Before any AppSource submission run through this list:

- [ ] Prefix/suffix registered with Microsoft
- [ ] All objects and fields use the registered prefix/suffix
- [ ] `logo` in `app.json` — 240×240 PNG, file exists
- [ ] `brief` and `description` in `app.json` — meaningful content
- [ ] `privacyStatementUrl` — live URL, returns 200
- [ ] `helpBaseUrl` — live URL with `{0}/{1}` placeholders
- [ ] `"TranslationFile"` in features array
- [ ] Test app is a separate project
- [ ] No `ObsoleteState = Removed` references
- [ ] No blanket `#pragma warning disable`
- [ ] All `dependencies` are published to AppSource
- [ ] No numeric IDs in `RunObject`
- [ ] `InherentPermissions` and `InherentEntitlements` on all codeunits
- [ ] Upgrade codeunit present (if previous version exists)
- [ ] Build passes with zero CodeCop errors
