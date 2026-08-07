// ─────────────────────────────────────────────────────────────────────────────
// Template: Upgrade Tag Definitions codeunit
// One procedure per tag. If a definitions codeunit already exists in
// the project, ADD the GetDefaultReportSelectionTag procedure to it —
// do NOT create a duplicate.
//
// Replace: {ID}            → object ID from app.json idRanges
//          {Affix}         → project affix (e.g. BCS)
//          {ShortName}     → short entity name (e.g. Stat. Acc.)
//          {Publisher}     → publisher name from app.json (e.g. "BC Scout")
//          {YYYYMMDD}      → today's date, used to make the tag unique
// ─────────────────────────────────────────────────────────────────────────────
codeunit {ID} "{Affix} {ShortName} Upg. Tag Def."
{
    Access = Internal;

    procedure GetDefaultReportSelectionTag(): Code[250]
    begin
        exit(
            '{Publisher}-{Affix}-{ShortName}-DefaultReportSelection-{YYYYMMDD}');
    end;
}
