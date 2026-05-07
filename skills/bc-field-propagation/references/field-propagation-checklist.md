# Field Propagation Pre-Commit Checklist

Run this checklist before committing any field propagation implementation.

---

## Step 1 — Pattern Decision

- [ ] I opened the posting codeunit and searched for `TransferFields` between the source record and the posted record.
- [ ] I have confirmed: **Pattern A** (TransferFields found) or **Pattern B** (no TransferFields).

---

## Step 2 — Field Identity (both patterns)

- [ ] Source TableExt uses the same **Field ID** as every target TableExt.
- [ ] Source TableExt uses the same **Field Name** as every target TableExt.
- [ ] Source TableExt uses the same **Field Type** as every target TableExt.
- [ ] `Caption` is set (English + translated) on all TableExts.
- [ ] No `ValidateTableRelation` issues on posted tables (set to `false` if the relation does not exist on the posted table).

---

## Step 3 — Pattern A only

- [ ] I added the field to the source TableExt.
- [ ] I added the field (same ID/name/type) to **all** relevant target TableExts (posted, archive, return).
- [ ] I verified that no existing EventSubscriber manually copies this field (would be redundant — delete it).
- [ ] I validated with a test posting that the field value appears on the posted document.

---

## Step 4 — Pattern B only

- [ ] I added the field to the source TableExt.
- [ ] I added the field (same ID/name/type) to **all** relevant target TableExts.
- [ ] I created (or extended) one dedicated EventSubscriber codeunit for the module/posting chain.
- [ ] The subscriber codeunit contains subscribers for ALL target tables of this posting chain — not scattered across multiple codeunits.
- [ ] I selected the correct event from `references/pattern-b-event-map.md`.
- [ ] The subscriber is `local procedure` with the correct parameter signature.
- [ ] `SkipOnMissingLicense` and `SkipOnMissingPermission` are set to `false` (default) unless there is a specific reason.
- [ ] I validated with a test posting that the field value appears on the posted entry.

---

## Step 5 — Both patterns

- [ ] `DataClassification` is set on all new fields (use `CustomerContent` if the field holds business data).
- [ ] No `Editable = false` on source TableExt fields that the user must fill in.
- [ ] FlowFields and FlowFilters are NOT expected to transfer — I added `CalcFields` where the value is needed.
- [ ] I confirmed the field does not appear in any `Modify(false)` context that would prevent the assignment from being persisted.
- [ ] Permission set is updated to include new tables or any new codeunit.
- [ ] The new codeunit (Pattern B) is registered in the permission set with Execute permission.

---

## Step 6 — Anti-Pattern Check

- [ ] I searched for any existing subscriber that copies this field manually. If found and Pattern A applies, I removed the subscriber.
- [ ] The subscriber codeunit (Pattern B) does not mix subscribers from different posting chains.
- [ ] I did not create a new subscriber for a field that `TransferFields` already handles.
