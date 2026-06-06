# Migration Extensibility Reference

This document is intentionally runtime-agnostic.

Use it to distinguish between:
- object references that usually exist in the pricing stack
- migration publisher names that still need runtime confirmation before coding

---

## Objects to Confirm in Your Runtime

### Codeunit "Price List Management" (7017)

This codeunit is part of the pricing area in modern runtimes.
However, this document does not hardcode `OnAfterCopyFrom*` publisher names,
because those names must be confirmed from the loaded symbol package of the
target environment.

If you need to migrate custom fields, first rediscover the concrete publisher in
your runtime with AL symbols, and only then write the subscriber.

---

## Common Registration Event in Codeunit "Price Calculation Mgt."

### OnFindSupportedSetup
Use this to register a custom price calculation method.

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Price Calculation Mgt.",
    'OnFindSupportedSetup', '', false, false)]
local procedure OnFindSupportedSetup(
    var TempPriceCalculationSetup: Record "Price Calculation Setup" temporary)
begin
    TempPriceCalculationSetup.InsertDuplicate(
        Enum::"Price Calculation Method"::"My Custom Method",
        Enum::"Price Type"::Sale,
        Enum::"Price Asset Type"::Item,
        Codeunit::"My Price Calculation",
        false);
end;
```

---

## Important Notes

1. Migration is one-time and irreversible. Events fire only during the
   initial migration when the Feature Update is enabled.

2. Confirm migration publishers before subscribing. Use AL symbols to
   inspect the pricing codeunits in your target runtime instead of copying
   `OnAfterCopyFrom*` names from older examples.

3. Test in sandbox first. Enable the Feature Update in a sandbox with a
   copy of production data, subscribe to all migration events, and verify
   custom fields are correctly populated before touching production.

4. Verify Lines after migration. After migration, run the `Verify Lines`
   action on price lists to detect duplicates or conflicts introduced by
   the migration of custom data.

5. Status after migration. Migrated price lists are created with
   `Status = Active`. New price lists created manually start as `Status = Draft`
   and must be manually activated.