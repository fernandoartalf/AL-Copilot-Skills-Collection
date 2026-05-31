// ─────────────────────────────────────────────────────────────────────────────
// Template: Workflow Setup Codeunit
// Replace: {ID}, {Affix}, {ShortName}, {EntityTable}, {ApprovalMgmtCU},
//          {CategoryCode}, {CategoryDesc}, {WorkflowCode}, {WorkflowDesc}
// ─────────────────────────────────────────────────────────────────────────────
codeunit {ID} "{Affix} {ShortName} Workflow Setup"
{
    // ─────────────────────────────────────────────
    // Workflow Category
    // ─────────────────────────────────────────────

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Setup",
        'OnAddWorkflowCategoriesToLibrary', '', true, true)]
    local procedure OnAddWorkflowCategoriesToLibrary()
    begin
        WorkflowSetup.InsertWorkflowCategory(
            CategoryCodeLbl, CategoryDescLbl);
    end;

    // ─────────────────────────────────────────────
    // Approval Table Relations
    // ─────────────────────────────────────────────

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Setup",
        'OnAfterInsertApprovalsTableRelations', '', true, true)]
    local procedure OnAfterInsertApprovalsTableRelations()
    var
        ApprovalEntry: Record "Approval Entry";
        WorkflowWebhookEntry: Record "Workflow Webhook Entry";
    begin
        WorkflowSetup.InsertTableRelation(
            Database::"{EntityTable}", 0,
            Database::"Approval Entry",
            ApprovalEntry.FieldNo("Record ID to Approve"));

        WorkflowSetup.InsertTableRelation(
            Database::"{EntityTable}", {EntityVar}.FieldNo(SystemId),
            Database::"Workflow Webhook Entry",
            WorkflowWebhookEntry.FieldNo("Data ID"));
    end;

    // ─────────────────────────────────────────────
    // Workflow Template
    // ─────────────────────────────────────────────

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Setup",
        'OnInsertWorkflowTemplates', '', true, true)]
    local procedure OnInsertWorkflowTemplates()
    begin
        InsertApprovalWorkflowTemplate();
    end;

    local procedure InsertApprovalWorkflowTemplate()
    var
        Workflow: Record Workflow;
    begin
        WorkflowSetup.InsertWorkflowTemplate(
            Workflow,
            WorkflowCodeLbl,
            WorkflowDescLbl,
            CategoryCodeLbl);

        UpdateMatrixData();
        InsertApprovalWorkflowDetails(Workflow);
        WorkflowSetup.MarkWorkflowAsTemplate(Workflow);
    end;

    local procedure InsertApprovalWorkflowDetails(var Workflow: Record Workflow)
    var
        WorkflowStepArgument: Record "Workflow Step Argument";
        BlankDateFormula: DateFormula;
        EntityRec: Record "{EntityTable}";
    begin
        WorkflowSetup.InitWorkflowStepArgument(
            WorkflowStepArgument,
            WorkflowStepArgument."Approver Type"::Approver,
            WorkflowStepArgument."Approver Limit Type"::"{ApproverLimitType}",
            0, '', BlankDateFormula, true);

        EntityRec.Init();

        WorkflowSetup.InsertRecApprovalWorkflowSteps(
            Workflow,
            BuildConditions(EntityRec),
            ApprovalMgmt.RunWorkflowOnSend{ShortName}ForApprovalCode(),
            WorkflowResponseHandling.CreateApprovalRequestsCode(),
            WorkflowResponseHandling.SendApprovalRequestForApprovalCode(),
            ApprovalMgmt.RunWorkflowOnCancel{ShortName}ApprovalRequestCode(),
            WorkflowStepArgument, false, false);
    end;

    /// <summary>
    /// Registers WF Event/Response Combination records so the workflow editor
    /// shows all response options for the custom events. Without this, responses
    /// like "Set Status to Pending Approval" are missing from the step config UI.
    /// </summary>
    local procedure UpdateMatrixData()
    var
        WFEventResponseCombination: Record "WF Event/Response Combination";
        WorkflowResponse: Record "Workflow Response";
    begin
        // Send Approval Request For Approval
        if WorkflowResponse.Get(SENDAPPROVALREQUESTFORAPPROVALLbl) then
            WorkflowResponse.MakeIndependent(
                ApprovalMgmt.RunWorkflowOnSend{ShortName}ForApprovalCode());

        // Set Status to Pending Approval
        if WorkflowResponse.Get(SETSTATUSTOPENDINGAPPROVALLbl) then
            WorkflowResponse.MakeIndependent(
                ApprovalMgmt.RunWorkflowOnSend{ShortName}ForApprovalCode());

        // Send Notification to Webhook
        if WorkflowResponse.Get(SENDNOTIFICATIONTOWEBHOOKLbl) then
            WorkflowResponse.MakeIndependent(
                ApprovalMgmt.RunWorkflowOnSend{ShortName}ForApprovalCode());

        // Cancel All Approval Requests
        if WorkflowResponse.Get(CANCELALLAPPROVALREQUESTSLbl) then
            WorkflowResponse.MakeIndependent(
                ApprovalMgmt.RunWorkflowOnCancel{ShortName}ApprovalRequestCode());
    end;

    local procedure BuildConditions(var EntityRec: Record "{EntityTable}"): Text
    begin
        exit(StrSubstNo(
            ConditionTxt,
            WorkflowSetup.Encode(EntityRec.GetView(false))));
    end;

    var
        WorkflowSetup: Codeunit "Workflow Setup";
        WorkflowResponseHandling: Codeunit "Workflow Response Handling";
        ApprovalMgmt: Codeunit "{ApprovalMgmtCU}";
        SENDAPPROVALREQUESTFORAPPROVALLbl: Label 'SENDAPPROVALREQUESTFORAPPROVAL', Locked = true;
        SENDNOTIFICATIONTOWEBHOOKLbl: Label 'SENDNOTIFICATIONTOWEBHOOK', Locked = true;
        SETSTATUSTOPENDINGAPPROVALLbl: Label 'SETSTATUSTOPENDINGAPPROVAL', Locked = true;
        CANCELALLAPPROVALREQUESTSLbl: Label 'CANCELALLAPPROVALREQUESTS', Locked = true;
        CategoryCodeLbl: Label '{CategoryCode}', Locked = true;
        CategoryDescLbl: Label '{CategoryDesc}';
        WorkflowCodeLbl: Label '{WorkflowCode}', Locked = true;
        WorkflowDescLbl: Label '{WorkflowDesc}';
        ConditionTxt:
            Label '<?xml version="1.0" encoding="utf-8" standalone="yes"?><ReportParameters><DataItems><DataItem name="{EntityTable}">%1</DataItem></DataItems></ReportParameters>',
            Locked = true;
}
