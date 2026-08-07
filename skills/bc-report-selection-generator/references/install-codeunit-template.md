// ─────────────────────────────────────────────────────────────────────────────
// Template: Install codeunit that seeds a default Report Selections entry
// If an install codeunit for this feature already exists, ADD the
// InsertDefault{ShortName}ReportSelection call into its
// OnInstallAppPerCompany trigger and re-use its helper — do NOT create
// a duplicate install codeunit.
//
// Replace: {ID}            → object ID from app.json idRanges
//          {Affix}         → project affix (e.g. BCS)
//          {ShortName}     → short entity name (e.g. Stat. Acc.)
//          {UsageValue}    → the new Usage value on "Report Selection Usage"
//          {DefaultReport} → the default Report object name to seed
// ─────────────────────────────────────────────────────────────────────────────
codeunit {ID} "{Affix} {ShortName} Install"
{
    Subtype = Install;
    Access = Internal;

    trigger OnInstallAppPerCompany()
    var
        ModuleInfo: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(ModuleInfo);

        // Fresh install → seed default configuration.
        if ModuleInfo.DataVersion() = Version.Create(0, 0, 0, 0) then
            InsertDefault{ShortName}ReportSelection();
    end;

    internal procedure InsertDefault{ShortName}ReportSelection()
    var
        ReportSelection: Record "Report Selections";
    begin
        ReportSelection.SetRange(
            Usage, ReportSelection.Usage::{UsageValue});
        // Never overwrite existing customer configuration.
        if not ReportSelection.IsEmpty() then
            exit;

        ReportSelection.Init();
        ReportSelection.Usage := ReportSelection.Usage::{UsageValue};
        ReportSelection.Sequence := '1';
        ReportSelection.Validate("Report ID", Report::"{DefaultReport}");
        ReportSelection.Insert(true);
    end;
}
