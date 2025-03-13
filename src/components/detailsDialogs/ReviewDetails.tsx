import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Review, ReviewStatus, OverallValidationStatus } from "@/types/Review";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ReviewDetailsProps {
  review: Review;
  open: boolean;
  onClose: () => void;
}

export function ReviewDetails({ review, open, onClose }: ReviewDetailsProps) {
  // Function to get appropriate badge color based on status
  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case ReviewStatus.rejected:
        return <Badge className="bg-red-500">Rejected</Badge>;
      case ReviewStatus.pending:
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const getValidationStatusBadge = (status: OverallValidationStatus) => {
    switch (status) {
      case OverallValidationStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case OverallValidationStatus.rejected:
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-medium">Review ID</span>
                <span className="text-sm font-mono">{review.review_id}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Submission ID</span>
                <span className="text-sm font-mono">
                  {review.submission_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">
                  Special Review Required
                </span>
                <Badge
                  variant={
                    review.special_review_required ? "default" : "outline"
                  }
                >
                  {review.special_review_required ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Reviewer</span>
                <span className="text-sm">{review.reviewer_name}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Review Status</span>
                {getStatusBadge(review.review_status)}
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Review Date</span>
                <span className="text-sm">
                  {format(new Date(review.review_timestamp), "PPP")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">
                  Overall Validation Status
                </span>
                {getValidationStatusBadge(review.overall_validation_status)}
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">
                  Last Validation Date
                </span>
                <span className="text-sm">
                  {format(new Date(review.last_overall_validation_date), "PPP")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Updated By</span>
                <span className="text-sm">{review.updated_by}</span>
              </div>

              {review.review_rejection_reason && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Rejection Reason
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.review_rejection_reason}
                  </p>
                </div>
              )}

              {review.notes && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.notes}
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
