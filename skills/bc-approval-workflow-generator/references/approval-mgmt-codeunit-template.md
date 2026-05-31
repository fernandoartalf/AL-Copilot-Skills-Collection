// ─────────────────────────────────────────────────────────────────────────────
// Template: Approval Management Codeunit
// Replace: {ID}, {Affix}, {ShortName}, {EntityName}, {EntityTable},
//          {CardPageName}, {SendEventCode}, {CancelEventCode}
// This codeunit contains ALL event subscribers for the approval workflow.
// ─────────────────────────────────────────────────────────────────────────────
codeunit {ID} "{Affix} {ShortName} Approval Mgmt."
{
    // ═══════════════════════════════════════════════════════════════════════════
    // INTEGRATION EVENTS (Publishers)
    // ═══════════════════════════════════════════════════════════════════════════

    [IntegrationEvent(false, false)]
    procedure OnSend{ShortName}ForApproval(var {EntityVar}: Record "{EntityTable}")
    begin
    end;

    [IntegrationEvent(false, false)]
    procedure OnCancel{ShortName}ApprovalRequest(var {EntityVar}: Record "{EntityTable}")
    begin
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════

    procedure Check{ShortName}ApprovalPossible(var {EntityVar}: Record "{EntityTable}"): Boolean
    begin
        if not Is{ShortName}ApprovalWorkflowEnabled({EntityVar}) then
            Error(NoWorkflowEnabledErr);

        exit(true);
    end;

    procedure Is{ShortName}ApprovalWorkflowEnabled(var {EntityVar}: Record "{EntityTable}"): Boolean
    begin
        exit(WorkflowManagement.CanExecuteWorkflow(
            {EntityVar},
            RunWorkflowOnSend{ShortName}ForApprovalCode()));
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT CODE IDENTIFIERS
    // ═══════════════════════════════════════════════════════════════════════════

    procedure RunWorkflowOnSend{ShortName}ForApprovalCode(): Code[128]
    begin
        exit(UpperCase('{SendEventCode}'));
    end;

    procedure RunWorkflowOnCancel{ShortName}ApprovalRequestCode(): Code[128]
    begin
        exit(UpperCase('{CancelEventCode}'));
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // WORKFLOW EVENT HANDLERS (subscribe to own publishers)
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"{Affix} {ShortName} Approval Mgmt.",
        'OnSend{ShortName}ForApproval', '', true, true)]
    local procedure RunWorkflowOnSend{ShortName}ForApproval(
        var {EntityVar}: Record "{EntityTable}")
    begin
        WorkflowManagement.HandleEvent(
            RunWorkflowOnSend{ShortName}ForApprovalCode(), {EntityVar});
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"{Affix} {ShortName} Approval Mgmt.",
        'OnCancel{ShortName}ApprovalRequest', '', true, true)]
    local procedure RunWorkflowOnCancel{ShortName}ApprovalRequest(
        var {EntityVar}: Record "{EntityTable}")
    begin
        WorkflowManagement.HandleEvent(
            RunWorkflowOnCancel{ShortName}ApprovalRequestCode(), {EntityVar});
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // WORKFLOW EVENT LIBRARY
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Event Handling",
        'OnAddWorkflowEventsToLibrary', '', false, false)]
    local procedure OnAddWorkflowEventsToLibrary()
    begin
        WorkflowEventHandling.AddEventToLibrary(
            RunWorkflowOnSend{ShortName}ForApprovalCode(),
            Database::"{EntityTable}",
            SendForApprovalEventDescTxt, 0, false);

        WorkflowEventHandling.AddEventToLibrary(
            RunWorkflowOnCancel{ShortName}ApprovalRequestCode(),
            Database::"{EntityTable}",
            CancelApprovalEventDescTxt, 0, false);
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT PREDECESSORS
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Event Handling",
        'OnAddWorkflowEventPredecessorsToLibrary', '', false, false)]
    local procedure OnAddWorkflowEventPredecessorsToLibrary(
        EventFunctionName: Code[128])
    begin
        case EventFunctionName of
            RunWorkflowOnCancel{ShortName}ApprovalRequestCode():
                WorkflowEventHandling.AddEventPredecessor(
                    RunWorkflowOnCancel{ShortName}ApprovalRequestCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());

            WorkflowEventHandling.RunWorkflowOnApproveApprovalRequestCode():
                WorkflowEventHandling.AddEventPredecessor(
                    WorkflowEventHandling.RunWorkflowOnApproveApprovalRequestCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());

            WorkflowEventHandling.RunWorkflowOnRejectApprovalRequestCode():
                WorkflowEventHandling.AddEventPredecessor(
                    WorkflowEventHandling.RunWorkflowOnRejectApprovalRequestCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());

            WorkflowEventHandling.RunWorkflowOnDelegateApprovalRequestCode():
                WorkflowEventHandling.AddEventPredecessor(
                    WorkflowEventHandling.RunWorkflowOnDelegateApprovalRequestCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());
        end;
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // APPROVAL ENTRY POPULATION
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Approvals Mgmt.",
        'OnPopulateApprovalEntryArgument', '', false, false)]
    local procedure OnPopulateApprovalEntryArgument(
        var ApprovalEntryArgument: Record "Approval Entry";
        var RecRef: RecordRef;
        WorkflowStepInstance: Record "Workflow Step Instance")
    var
        {EntityVar}: Record "{EntityTable}";
    begin
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    ApprovalEntryArgument."Document No." := {EntityVar}."{PrimaryKeyField}";
                    ApprovalEntryArgument."Table ID" := Database::"{EntityTable}";
                end;
        end;
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS UPDATES
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Approvals Mgmt.",
        'OnSetStatusToPendingApproval', '', false, false)]
    local procedure OnSetStatusToPendingApproval(
        RecRef: RecordRef; var Variant: Variant; var IsHandled: Boolean)
    var
        {EntityVar}: Record "{EntityTable}";
    begin
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    {EntityVar}.Validate(
                        "{Affix} Approval Status",
                        {EntityVar}."{Affix} Approval Status"::"Pending Approval");
                    {EntityVar}.Modify(true);
                    Variant := {EntityVar};
                    IsHandled := true;
                end;
        end;
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Approvals Mgmt.",
        'OnApproveApprovalRequest', '', false, false)]
    local procedure OnApproveApprovalRequest(var ApprovalEntry: Record "Approval Entry")
    var
        RecRef: RecordRef;
        {EntityVar}: Record "{EntityTable}";
        ApprovalsMgmt: Codeunit "Approvals Mgmt.";
    begin
        RecRef.Get(ApprovalEntry."Record ID to Approve");
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    if not ApprovalsMgmt.HasOpenPendingApprovalEntries(
                        ApprovalEntry."Record ID to Approve")
                    then begin
                        {EntityVar}."{Affix} Approval Status" :=
                            {EntityVar}."{Affix} Approval Status"::Approved;
                        {EntityVar}.Modify(true);
                    end;
                end;
        end;
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Approvals Mgmt.",
        'OnRejectApprovalRequest', '', false, false)]
    local procedure OnRejectApprovalRequest(var ApprovalEntry: Record "Approval Entry")
    var
        RecRef: RecordRef;
        {EntityVar}: Record "{EntityTable}";
    begin
        RecRef.Get(ApprovalEntry."Record ID to Approve");
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    {EntityVar}."{Affix} Approval Status" :=
                        {EntityVar}."{Affix} Approval Status"::Rejected;
                    {EntityVar}.Modify(true);
                end;
        end;
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Approvals Mgmt.",
        'OnBeforeShowCommonApprovalStatus', '', false, false)]
    local procedure OnBeforeShowCommonApprovalStatus(
        var RecRef: RecordRef; var IsHandled: Boolean)
    var
        {EntityVar}: Record "{EntityTable}";
    begin
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    case {EntityVar}."{Affix} Approval Status" of
                        {EntityVar}."{Affix} Approval Status"::Open:
                            ;
                        {EntityVar}."{Affix} Approval Status"::"Pending Approval":
                            Message(PendingApprovalMsg);
                        {EntityVar}."{Affix} Approval Status"::Approved:
                            Message(ApprovedMsg);
                        {EntityVar}."{Affix} Approval Status"::Rejected:
                            Message(RejectedMsg);
                    end;
                    IsHandled := true;
                end;
        end;
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // WORKFLOW RESPONSE HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Response Handling",
        'OnReleaseDocument', '', true, true)]
    local procedure OnReleaseDocument(RecRef: RecordRef; var Handled: Boolean)
    var
        {EntityVar}: Record "{EntityTable}";
    begin
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    {EntityVar}."{Affix} Approval Status" :=
                        {EntityVar}."{Affix} Approval Status"::Approved;
                    {EntityVar}.Modify(true);
                    Handled := true;
                end;
        end;
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Response Handling",
        'OnOpenDocument', '', true, true)]
    local procedure OnOpenDocument(RecRef: RecordRef; var Handled: Boolean)
    var
        {EntityVar}: Record "{EntityTable}";
    begin
        case RecRef.Number of
            Database::"{EntityTable}":
                begin
                    RecRef.SetTable({EntityVar});
                    {EntityVar}.Validate(
                        "{Affix} Approval Status",
                        {EntityVar}."{Affix} Approval Status"::Open);
                    {EntityVar}.Modify(true);
                    Handled := true;
                end;
        end;
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE PREDECESSORS
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Workflow Response Handling",
        'OnAddWorkflowResponsePredecessorsToLibrary', '', false, false)]
    local procedure OnAddWorkflowResponsePredecessorsToLibrary(
        ResponseFunctionName: Code[128])
    begin
        case ResponseFunctionName of
            WorkflowResponseHandling.SendApprovalRequestForApprovalCode():
                WorkflowResponseHandling.AddResponsePredecessor(
                    WorkflowResponseHandling.SendApprovalRequestForApprovalCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());

            WorkflowResponseHandling.SetStatusToPendingApprovalCode():
                WorkflowResponseHandling.AddResponsePredecessor(
                    WorkflowResponseHandling.SetStatusToPendingApprovalCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());

            WorkflowResponseHandling.CancelAllApprovalRequestsCode():
                WorkflowResponseHandling.AddResponsePredecessor(
                    WorkflowResponseHandling.CancelAllApprovalRequestsCode(),
                    RunWorkflowOnCancel{ShortName}ApprovalRequestCode());

            WorkflowResponseHandling.OpenDocumentCode():
                WorkflowResponseHandling.AddResponsePredecessor(
                    WorkflowResponseHandling.OpenDocumentCode(),
                    RunWorkflowOnCancel{ShortName}ApprovalRequestCode());

            WorkflowResponseHandling.CreateApprovalRequestsCode():
                WorkflowResponseHandling.AddResponsePredecessor(
                    WorkflowResponseHandling.CreateApprovalRequestsCode(),
                    RunWorkflowOnSend{ShortName}ForApprovalCode());
        end;
    end;

    // ═══════════════════════════════════════════════════════════════════════════
    // CARD PAGE MAPPING
    // ═══════════════════════════════════════════════════════════════════════════

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Page Management",
        'OnConditionalCardPageIDNotFound', '', true, true)]
    local procedure OnConditionalCardPageIDNotFound(
        RecordRef: RecordRef; var CardPageID: Integer)
    begin
        case RecordRef.Number of
            Database::"{EntityTable}":
                CardPageID := Page::"{CardPageName}";
        end;
    end;

    var
        WorkflowManagement: Codeunit "Workflow Management";
        WorkflowEventHandling: Codeunit "Workflow Event Handling";
        WorkflowResponseHandling: Codeunit "Workflow Response Handling";
        NoWorkflowEnabledErr:
            Label 'No approval workflow for this record type is enabled.';
        SendForApprovalEventDescTxt:
            Label 'Approval of a {EntityCaption} is requested.';
        CancelApprovalEventDescTxt:
            Label 'An approval request for a {EntityCaption} is canceled.';
        PendingApprovalMsg:
            Label 'An approval request has been sent.';
        ApprovedMsg:
            Label 'The {EntityCaption} has been approved.';
        RejectedMsg:
            Label 'The {EntityCaption} has been rejected.';
}
