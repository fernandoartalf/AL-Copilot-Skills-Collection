// ─────────────────────────────────────────────────────────────────────────────
// Template: Table Extension — Approval Status Field + Deletion Guard
// Replace: {ID}, {Affix}, {EntityName}, {FieldID}, {EnumName}
// Use this template when extending a STANDARD BC table.
// For custom tables, add the field and OnDelete logic directly.
// ─────────────────────────────────────────────────────────────────────────────
tableextension { ID} "{Affix} {EntityName}" extends "{EntityName}"
{
    fields
    {
        field({FieldID}; "{Affix} Approval Status"; Enum "{EnumName}")
        {
            Caption = 'Approval Status';
            DataClassification = CustomerContent;
            Editable = false;
        }
    }

    trigger OnBeforeDelete()
    var
        ApprovalsMgmt: Codeunit "Approvals Mgmt.";
    begin
        {Affix}CheckApprovalStatus();
        ApprovalsMgmt.DeleteApprovalEntries(Rec.RecordId);
    end;

    local procedure {Affix}CheckApprovalStatus()
    var
        StatusErr: Label 'You cannot delete a {EntityName} with Approval Status %1.',
            Comment = '%1 = Approval Status value';
    begin
        if Rec."{Affix} Approval Status" in
            [Rec."{Affix} Approval Status"::Approved,
             Rec."{Affix} Approval Status"::"Pending Approval"]
        then
            Error(StatusErr, Rec."{Affix} Approval Status");
    end;
}
