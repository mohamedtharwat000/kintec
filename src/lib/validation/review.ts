import { z } from "zod";
import { Review, ReviewStatus, OverallValidationStatus } from "@/types/Review";

export const reviewSchema = z.object({
  submission_id: z.string().min(1, "Submission ID is required"),
  special_review_required: z.boolean(),
  reviewer_name: z.string().min(1, "Reviewer name is required"),
  review_status: z.nativeEnum(ReviewStatus),
  review_timestamp: z.string().min(1, "Review timestamp is required"),
  review_rejection_reason: z.string().optional(),
  overall_validation_status: z.nativeEnum(OverallValidationStatus),
  last_overall_validation_date: z
    .string()
    .min(1, "Validation date is required"),
  updated_by: z.string().min(1, "Updated by is required"),
  notes: z.string().optional(),
});

export type ReviewValidation = z.infer<typeof reviewSchema>;

export function validateReview(
  data: Partial<Review>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = reviewSchema.safeParse(row);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        validationErrors.push({
          row: rowNumber,
          error: `${err.path}: ${err.message}`,
        });
      });
    }
  });

  return validationErrors;
}
