import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Submission } from "@/types/Submission";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface SubmissionDetailsProps {
  submission: Submission;
  open: boolean;
  onClose: () => void;
}

export function SubmissionDetails({
  submission,
  open,
  onClose,
}: SubmissionDetailsProps) {
  const validationRulesCount = submission.validation_rules?.length || 0;
  const reviewsCount = submission.reviews?.length || 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-medium">Submission ID</span>
                <span className="text-sm font-mono">
                  {submission.submission_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Contractor ID</span>
                <span className="text-sm font-mono">
                  {submission.contractor_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Order Type & ID</span>
                <span className="text-sm">
                  {submission.PO_id
                    ? `PO: ${submission.PO_id}`
                    : submission.CWO_id
                    ? `CWO: ${submission.CWO_id}`
                    : "N/A"}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Billing Period</span>
                <span className="text-sm">
                  {format(new Date(submission.billing_period), "PPP")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Payment Currency</span>
                <span className="text-sm">{submission.payment_currency}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Invoice Currency</span>
                <span className="text-sm">{submission.invoice_currency}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Invoice Due Date</span>
                <span className="text-sm">
                  {format(new Date(submission.invoice_due_date), "PPP")}
                </span>
              </div>

              {submission.wht_rate !== undefined && (
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium">WHT Rate</span>
                  <span className="text-sm">{submission.wht_rate}%</span>
                </div>
              )}

              {submission.wht_applicable !== undefined && (
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium">WHT Applicable</span>
                  <Badge
                    variant={submission.wht_applicable ? "default" : "outline"}
                  >
                    {submission.wht_applicable ? "Yes" : "No"}
                  </Badge>
                </div>
              )}

              {submission.external_assignment !== undefined && (
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium">
                    External Assignment
                  </span>
                  <Badge
                    variant={
                      submission.external_assignment ? "default" : "outline"
                    }
                  >
                    {submission.external_assignment ? "Yes" : "No"}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {validationRulesCount > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30">
                <span className="text-sm font-medium">Validation Rules</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  This submission has {validationRulesCount} associated
                  validation rule(s)
                </p>
              </div>
            </div>
          )}

          {reviewsCount > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30">
                <span className="text-sm font-medium">Reviews</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  This submission has {reviewsCount} associated review(s)
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
