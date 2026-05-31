// ─────────────────────────────────────────────────────────────────────────────
// Template: Page Extension — Card with Approval Actions
// Replace: {ID}, {Affix}, {EntityName}, {CardPageName}, {ApprovalMgmtCU},
//          {ShortName}, {SubPagePartName} (optional, for locking lines)
// ─────────────────────────────────────────────────────────────────────────────
pageextension { ID} "{Affix} {EntityName} Card" extends "{CardPageName}"
{
    layout
    {
        // Lock the General group when approval is pending/approved
        modify(General)
        {
            Editable = {Affix}PageEditable;
        }

        // Add the Approval Status field after the primary key field
        addafter("{PrimaryKeyFieldOnPage}")
        {
            field("{Affix} Approval Status"; Rec."{Affix} Approval Status")
            {
                ApplicationArea = All;
                Caption = 'Approval Status';
                Editable = false;
                StyleExpr = {Affix}ApprovalStatusStyleTxt;
                ToolTip = 'Specifies the approval status of the {EntityName}.';
            }
        }

        // ─── OPTIONAL: Lock subpage lines when not Open ───
        // Uncomment and replace {SubPagePartName} if a subform must be locked
        // modify({SubPagePartName})
        // {
        //     Editable = {Affix}PageEditable;
        // }
    }

    actions
    {
        addlast(processing)
        {
            group("{Affix} {Affix}Approval")
            {
                Caption = 'Approval';
                Image = Approval;

                action("{Affix} {Affix}_SendApprovalRequest")
                {
                    ApplicationArea = All;
                    Caption = 'Send Approval Request';
                    Enabled = not OpenApprovalEntriesExist;
                    Image = SendApprovalRequest;
                    Promoted = true;
                    PromotedCategory = Process;
                    PromotedIsBig = true;
                    ToolTip = 'Send an approval request for this {EntityName}.';

                    trigger OnAction()
                    var
                        ApprovalMgmt: Codeunit "{ApprovalMgmtCU}";
                    begin
                        if ApprovalMgmt.Check{ShortName}ApprovalPossible(Rec) then
                            ApprovalMgmt.OnSend{ShortName}ForApproval(Rec);
                        CurrPage.Update(false);
                    end;
                }

                action("{Affix} {Affix}_CancelApprovalRequest")
                {
                    ApplicationArea = All;
                    Caption = 'Cancel Approval Request';
                    Enabled = CanCancelApprovalForRecord or CanCancelApprovalForFlow;
                    Image = CancelApprovalRequest;
                    Promoted = true;
                    PromotedCategory = Process;
                    ToolTip = 'Cancel the approval request for this {EntityName}.';

                    trigger OnAction()
                    var
                        {Affix}ApprovalMgmt: Codeunit "{ApprovalMgmtCU}";
                        WorkflowWebhookMgt: Codeunit "Workflow Webhook Management";
                    begin
                        {Affix}ApprovalMgmt.OnCancel{ShortName}ApprovalRequest(Rec);
                        {Affix}ApprovalMgmt.Set{EntityShortName}StatusToOpen(Rec);
                        WorkflowWebhookMgt.FindAndCancel(Rec.RecordId);
                        CurrPage.Update(false);
                    end;
                }
            }
        }
    }

    trigger OnAfterGetRecord()
    begin
        OpenApprovalEntriesExistForCurrUser :=
            ApprovalsMgmt.HasOpenApprovalEntriesForCurrentUser(Rec.RecordId);
        OpenApprovalEntriesExist :=
            ApprovalsMgmt.HasOpenApprovalEntries(Rec.RecordId);
        CanCancelApprovalForRecord :=
            ApprovalsMgmt.CanCancelApprovalForRecord(Rec.RecordId);
        WorkflowWebhookMgt.GetCanRequestAndCanCancel(
            Rec.RecordId, CanRequestApprovalForFlow, CanCancelApprovalForFlow);

        {Affix}SetApprovalStatusStyle();
        {Affix}PageEditable := Rec.{Affix}ApprovalStatusAllowModify();
    end;

    local procedure {Affix}SetApprovalStatusStyle()
    begin
        case Rec."{Affix} Approval Status" of
            Rec."{Affix} Approval Status"::Open:
                {Affix}ApprovalStatusStyleTxt := 'Standard';
            Rec."{Affix} Approval Status"::"Pending Approval":
                {Affix}ApprovalStatusStyleTxt := 'Ambiguous';
            Rec."{Affix} Approval Status"::Approved:
                {Affix}ApprovalStatusStyleTxt := 'Favorable';
            Rec."{Affix} Approval Status"::Rejected:
                {Affix}ApprovalStatusStyleTxt := 'Unfavorable';
        end;
    end;

    var
        ApprovalsMgmt: Codeunit "Approvals Mgmt.";
        WorkflowWebhookMgt: Codeunit "Workflow Webhook Management";
        OpenApprovalEntriesExistForCurrUser: Boolean;
        OpenApprovalEntriesExist: Boolean;
        CanCancelApprovalForRecord: Boolean;
        CanRequestApprovalForFlow: Boolean;
        CanCancelApprovalForFlow: Boolean;
        {Affix}PageEditable: Boolean;
        {Affix}ApprovalStatusStyleTxt: Text;
}
