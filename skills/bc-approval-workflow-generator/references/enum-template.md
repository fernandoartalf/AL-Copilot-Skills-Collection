// ─────────────────────────────────────────────────────────────────────────────
// Template: Approval Status Enum
// Replace: {ID}, {Affix}, {ShortName}, {EntityCaption}
// ─────────────────────────────────────────────────────────────────────────────
enum {ID} "{Affix} {ShortName} Appr. Status"
{
    Extensible = true;
    Caption = '{EntityCaption} Approval Status';

    value(0; "Open")
    {
        Caption = 'Open';
    }
    value(1; "Pending Approval")
    {
        Caption = 'Pending Approval';
    }
    value(2; "Rejected")
    {
        Caption = 'Rejected';
    }
    value(3; "Approved")
    {
        Caption = 'Approved';
    }
}
