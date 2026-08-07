// ─────────────────────────────────────────────────────────────────────────────
// Template: Report Selection Management codeunit
// Mirrors: base app codeunit 77 "Report Selections"
// Replace: {ID}            → object ID from app.json idRanges
//          {Affix}         → project affix (e.g. BCS)
//          {ShortName}     → short entity name (e.g. Stat. Acc.)
//          {SourceTable}   → source record type (e.g. "Statistical Account")
//          {UsageValue}    → the new Usage value on "Report Selection Usage"
//          {UsageCaption}  → user-facing caption for error messages
// ─────────────────────────────────────────────────────────────────────────────
codeunit {ID} "{Affix} {ShortName} Report Sel. Mgmt."
{
    Access = Public;

    var
        NoReportSelectedErr: Label 'No report is configured for %1. Set up the report in the Report Selection page.', Comment = '%1 = usage caption';
        UsageCaptionLbl: Label '{UsageCaption}';

    /// <summary>
    /// Runs every report configured for the {UsageCaption} usage, in
    /// Sequence order, using the source record as filter. The request
    /// page is displayed.
    /// </summary>
    procedure PrintReport(var SourceRec: Record {SourceTable})
    begin
        RunConfiguredReports(SourceRec, true);
    end;

    /// <summary>
    /// Runs every report configured for the {UsageCaption} usage, in
    /// Sequence order, using the source record as filter. The request
    /// page is skipped (silent run).
    /// </summary>
    procedure PrintReportSilently(var SourceRec: Record {SourceTable})
    begin
        RunConfiguredReports(SourceRec, false);
    end;

    local procedure RunConfiguredReports(var SourceRec: Record {SourceTable}; ShowRequestPage: Boolean)
    var
        ReportSelection: Record "Report Selections";
    begin
        ReportSelection.Reset();
        ReportSelection.SetRange(Usage, ReportSelection.Usage::{UsageValue});
        ReportSelection.SetFilter("Report ID", '<>0');
        ReportSelection.SetCurrentKey(Sequence);
        if not ReportSelection.FindSet() then
            Error(NoReportSelectedErr, UsageCaptionLbl);

        repeat
            Report.RunModal(
                ReportSelection."Report ID", ShowRequestPage, false, SourceRec);
        until ReportSelection.Next() = 0;
    end;

    /// <summary>
    /// Returns the first configured Report ID for the {UsageCaption}
    /// usage, or 0 if none is configured. Useful when the caller only
    /// needs the ID (e.g. to hand off to another API).
    /// </summary>
    procedure GetDefaultReportId(): Integer
    var
        ReportSelection: Record "Report Selections";
    begin
        ReportSelection.SetRange(Usage, ReportSelection.Usage::{UsageValue});
        ReportSelection.SetFilter("Report ID", '<>0');
        ReportSelection.SetCurrentKey(Sequence);
        if ReportSelection.FindFirst() then
            exit(ReportSelection."Report ID");

        exit(0);
    end;
}
