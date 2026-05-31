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
    begin
        WorkflowSetup.InsertTableRelation(
            Database::"{EntityTable}", 0,
            Database::"Approval Entry",
            ApprovalEntry.FieldNo("Record ID to Approve"));
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

        InsertApprovalWorkflowDetails(Workflow);
        WorkflowSetup.MarkWorkflowAsTemplate(Workflow);
    end;

    local procedure InsertApprovalWorkflowDetails(var Workflow: Record Workflow)
    var
        WorkflowStepArgument: Record "Workflow Step Argument";
        BlankDateFormula: DateFormula;
        EntityRec: Record "{EntityTable}";
        ApprovalMgmt: Codeunit "{ApprovalMgmtCU}";
    begin
        WorkflowSetup.PopulateWorkflowStepArgument(
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

    local procedure BuildConditions(var EntityRec: Record "{EntityTable}"): Text
    begin
        exit(StrSubstNo(
            ConditionTxt,
            WorkflowSetup.Encode(EntityRec.GetView(false))));
    end;

    var
        WorkflowSetup: Codeunit "Workflow Setup";
        WorkflowResponseHandling: Codeunit "Workflow Response Handling";
        CategoryCodeLbl: Label '{CategoryCode}', Locked = true;
        CategoryDescLbl: Label '{CategoryDesc}';
        WorkflowCodeLbl: Label '{WorkflowCode}', Locked = true;
        WorkflowDescLbl: Label '{WorkflowDesc}';
        ConditionTxt:
            Label '<?xml version="1.0" encoding="utf-8" standalone="yes"?><ReportParameters><DataItems><DataItem name="{EntityTable}">%1</DataItem></DataItems></ReportParameters>',
            Locked = true;
}
