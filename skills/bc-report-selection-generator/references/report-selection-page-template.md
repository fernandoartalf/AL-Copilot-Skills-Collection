// ─────────────────────────────────────────────────────────────────────────────
// Template: Report Selections setup page (dedicated to a single Usage)
// Mirrors: base app page 9657 "Report Selection - Sales"
// Replace: {ID}           → object ID from app.json idRanges
//          {Affix}        → project affix (e.g. BCS)
//          {ShortName}    → short entity name (e.g. Stat. Acc.)
//          {UsageValue}   → the new Usage value (e.g. "BCS Statement")
//          {UsageCaption} → user-facing page caption
// ─────────────────────────────────────────────────────────────────────────────
page {ID} "{Affix} {ShortName} Report Selection"
{
    ApplicationArea = All;
    Caption = '{UsageCaption} Report Selection';
    PageType = List;
    UsageCategory = Administration;
    SourceTable = "Report Selections";
    SourceTableView = sorting(Usage, Sequence) where(Usage = const({UsageValue}));
    DelayedInsert = true;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(Sequence; Rec.Sequence)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the order in which the reports are printed when more than one report is configured for this usage.';
                }
                field("Report ID"; Rec."Report ID")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the object ID of the report to run for this usage.';
                }
                field("Report Caption"; Rec."Report Caption")
                {
                    ApplicationArea = All;
                    DrillDown = false;
                    ToolTip = 'Specifies the caption of the report referenced by Report ID.';
                }
                field("Use for Email Body"; Rec."Use for Email Body")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies whether the report is used as the body of an outgoing email.';
                }
                field("Use for Email Attachment"; Rec."Use for Email Attachment")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies whether the report is attached to an outgoing email.';
                }
                field("Email Body Layout Description"; Rec."Email Body Layout Description")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the layout used when the report is used as the email body.';
                }
            }
        }
    }

    trigger OnOpenPage()
    begin
        // Lock the Usage filter so the user cannot remove it and edit
        // unrelated Report Selections entries.
        Rec.FilterGroup(2);
        Rec.SetRange(Usage, Rec.Usage::{UsageValue});
        Rec.FilterGroup(0);
    end;

    trigger OnNewRecord(BelowxRec: Boolean)
    begin
        Rec.Usage := Rec.Usage::{UsageValue};
    end;
}
