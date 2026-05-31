// ─────────────────────────────────────────────────────────────────────────────
// Template: Custom Page (Card) — with Approval Actions
// Replace: {ID}, {Affix}, {EntityName}, {EntityTable}, {ApprovalMgmtCU},
//          {ShortName}, {PrimaryKeyField}, {LinesPartName} (optional)
// Use this template when you OWN the page object (custom page, not extension).
// Actions, triggers, and layout go directly inside the page object.
// ─────────────────────────────────────────────────────────────────────────────
page {ID} "{Affix} {EntityName} Card"
{
    PageType = Card;
    SourceTable = "{EntityTable}";
    Caption = '{EntityName} Card';

    layout
    {
        area(content)
        {
            group(General)
            {
                Caption = 'General';
                Editable = PageEditable;

                field("{PrimaryKeyField}"; Rec."{PrimaryKeyField}")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the primary key.';
                }
                field("Approval Status"; Rec."Approval Status")
                {
                    ApplicationArea = All;
                    Caption = 'Approval Status';
                    Editable = false;
                    StyleExpr = ApprovalStatusStyleTxt;
                    ToolTip = 'Specifies the approval status of the {EntityName}.';
                }
            }

            // ─── OPTIONAL: Subpage lines part ───
            // part({LinesPartName}; "{Affix} {EntityName} Lines")
            // {
            //     ApplicationArea = All;
            //     SubPageLink = "Document No." = field("{PrimaryKeyField}");
            //     Editable = PageEditable;
            // }
        }
    }

    actions
    {
        area(processing)
        {
            group(Approval)
            {
                Caption = 'Approval';
                Image = Approval;

                action(SendApprovalRequest)
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

                action(CancelApprovalRequest)
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
                        ApprovalMgmt: Codeunit "{ApprovalMgmtCU}";
                        WorkflowWebhookMgt: Codeunit "Workflow Webhook Management";
                    begin
                        ApprovalMgmt.OnCancel{ShortName}ApprovalRequest(Rec);
                        ApprovalMgmt.Set{EntityShortName}StatusToOpen(Rec);
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

        SetApprovalStatusStyle();
        PageEditable := Rec.ApprovalStatusAllowModify();
    end;

    local procedure SetApprovalStatusStyle()
    begin
        case Rec."Approval Status" of
            Rec."Approval Status"::Open:
                ApprovalStatusStyleTxt := 'Standard';
            Rec."Approval Status"::"Pending Approval":
                ApprovalStatusStyleTxt := 'Ambiguous';
            Rec."Approval Status"::Approved:
                ApprovalStatusStyleTxt := 'Favorable';
            Rec."Approval Status"::Rejected:
                ApprovalStatusStyleTxt := 'Unfavorable';
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
        PageEditable: Boolean;
        ApprovalStatusStyleTxt: Text;
}
