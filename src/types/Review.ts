export interface Review {
  review_id: string;
  submission_id: string;
  special_review_required: boolean;
  reviewer_name: string;
  review_status: ReviewStatus;
  review_timestamp: Date;
  review_rejection_reason?: string;
  overall_validation_status: OverallValidationStatus;
  last_overall_validation_date: Date;
  updated_by: string;
  notes?: string;
}

export enum ReviewStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum OverallValidationStatus {
  approved = "approved",
  rejected = "rejected",
}
