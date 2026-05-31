// ─────────────────────────────────────────────────────────────────────────────
// Template: Custom Table — Approval Status Field + Deletion Guard
// Replace: {ID}, {Affix}, {EntityName}, {FieldID}, {EnumName}, {PrimaryKey}
// Use this template when you OWN the table (custom table, not a standard one).
// The field and OnDelete logic go directly inside the table object.
// ─────────────────────────────────────────────────────────────────────────────
table {ID} "{Affix} {EntityName}"
{
    Caption = '{EntityName}';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "{PrimaryKey}"; Code[20])
        {
            Caption = '{PrimaryKey}';
        }
        // ... other fields ...

        field({FieldID}; "Approval Status"; Enum "{EnumName}")
        {
            Caption = 'Approval Status';
            DataClassification = CustomerContent;
            Editable = false;
        }
    }

    keys
    {
        key(PK; "{PrimaryKey}")
        {
            Clustered = true;
        }
    }

    trigger OnDelete()
    var
        ApprovalsMgmt: Codeunit "Approvals Mgmt.";
    begin
        CheckApprovalStatus();
        ApprovalsMgmt.DeleteApprovalEntries(Rec.RecordId);
    end;

    procedure CheckApprovalStatus()
    var
        StatusErr: Label 'You cannot delete a %1 with Approval Status %2.',
            Comment = '%1 = Entity name, %2 = Approval Status value';
    begin
        if Rec."Approval Status" in
            [Rec."Approval Status"::Approved,
             Rec."Approval Status"::"Pending Approval"]
        then
            Error(StatusErr, TableCaption(), Rec."Approval Status");
    end;

    procedure ApprovalStatusAllowModify(): Boolean
    begin
        exit(not (Rec."Approval Status" in
            [Rec."Approval Status"::Approved,
             Rec."Approval Status"::"Pending Approval"]));
    end;

    procedure RecordExists(): Boolean
    begin
        // Replace with your own existence check (e.g. check for lines)
        exit(Rec."{PrimaryKey}" <> '');
    end;
}
