// ─────────────────────────────────────────────────────────────────────────────
// Template: Page action to trigger the configured report(s)
// Add this action inside the appropriate area(Processing) block of:
//   • a custom Page (you own it)               → add directly
//   • a standard Page (you don't own it)       → wrap in a pageextension
// The action ONLY delegates to the management codeunit — no inline
// Report.RunModal is allowed.
//
// Replace: {Affix}         → project affix (e.g. BCS)
//          {ShortName}     → short entity name (e.g. Stat. Acc.)
//          {SourceRecExpr} → expression yielding the record to pass
//                            (usually `Rec`, sometimes `HeaderRec` when
//                            the page is a lines page and the report
//                            expects the header)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Custom page (add inside area(Processing) → group(Category_Process)) ───
action({Affix}PrintDocument)
{
    ApplicationArea = All;
    Caption = 'Print';
    Image = Print;
    ToolTip = 'Print the document using the report configured on the Report Selection page.';

    trigger OnAction()
    var
        ReportSelMgmt: Codeunit "{Affix} {ShortName} Report Sel. Mgmt.";
    begin
        ReportSelMgmt.PrintReport({SourceRecExpr});
    end;
}


// ─── PageExtension against a standard page (Card / Document) ──────────────
// pageextension {ID} "{Affix} {ShortName} Card" extends "<Standard Card Page>"
// {
//     actions
//     {
//         addlast(Processing)
//         {
//             action({Affix}PrintDocument)
//             {
//                 ApplicationArea = All;
//                 Caption = 'Print';
//                 Image = Print;
//                 ToolTip = 'Print the document using the configured Report Selection.';
//
//                 trigger OnAction()
//                 var
//                     ReportSelMgmt: Codeunit "{Affix} {ShortName} Report Sel. Mgmt.";
//                 begin
//                     ReportSelMgmt.PrintReport({SourceRecExpr});
//                 end;
//             }
//         }
//
//         // Promote for BC 20+ (independent promotion)
//         addlast(Category_Process)
//         {
//             actionref({Affix}PrintDocumentRef; {Affix}PrintDocument) { }
//         }
//     }
// }
