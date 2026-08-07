// ─────────────────────────────────────────────────────────────────────────────
// Template: Enum Extension on "Report Selection Usage"
// Replace: {ID}            → object ID from app.json idRanges
//          {Affix}         → project affix (e.g. BCS)
//          {ShortName}     → short caption slice (e.g. Stat. Acc.)
//          {BaseEnum}      → one of:
//                            "Report Selection Usage"          (global, id 77)
//                            "Report Selection Usage Sales"
//                            "Report Selection Usage Purchase"
//                            "Report Selection Usage Service"
//                            "Report Selection Usage Bank"
//          {ValueID}       → new value ID inside idRanges (additive only)
//          {ValueName}     → PascalCase Usage identifier
//          {ValueCaption}  → caption WITHOUT commas (AS0087)
// ─────────────────────────────────────────────────────────────────────────────
enumextension {ID} "{Affix} {ShortName} Rep. Sel. Usage" extends {BaseEnum}
{
    value({ValueID}; "{Affix} {ValueName}")
    {
        Caption = '{ValueCaption}';
    }

    // Additional additive values — repeat as needed.
    // NEVER renumber. NEVER delete. Use ObsoleteState = Removed instead.
}
