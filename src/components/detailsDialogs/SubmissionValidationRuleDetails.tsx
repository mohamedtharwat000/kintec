import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubmissionValidationRule } from "@/types/Submission";

interface SubmissionValidationRuleDetailsProps {
  rule: SubmissionValidationRule;
  open: boolean;
  onClose: () => void;
}

export function SubmissionValidationRuleDetails({
  rule,
  open,
  onClose,
}: SubmissionValidationRuleDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Validation Rule Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-medium">Rule ID</span>
                <span className="text-sm font-mono">
                  {rule.sub_val_rule_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Submission ID</span>
                <span className="text-sm font-mono">{rule.submission_id}</span>
              </div>

              {rule.required_fields && (
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Required Fields</span>
                  <span className="text-sm">{rule.required_fields}</span>
                </div>
              )}

              {rule.approval_signature_rules && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Approval Signature Rules
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.approval_signature_rules}
                  </p>
                </div>
              )}

              {rule.approval_date_rules && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Approval Date Rules
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.approval_date_rules}
                  </p>
                </div>
              )}

              {rule.template_requirements && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Template Requirements
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.template_requirements}
                  </p>
                </div>
              )}

              {rule.workday_definitions && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Workday Definitions
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.workday_definitions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
