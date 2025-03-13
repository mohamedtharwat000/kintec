import Papa from "papaparse";
import { ReviewStatus, OverallValidationStatus } from "@/types/Review";

export const parseReview = async (file: File) => {
  return new Promise<{
    data: any[];
    dataToUpload: any[];
    errors: { row: number; error: string }[];
  }>((resolve, reject) => {
    const errors: { row: number; error: string }[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const dataToUpload = data.map((row: any, index: number) => {
          // Basic validation
          if (!row.submission_id) {
            errors.push({
              row: index + 1,
              error: "Submission ID is required",
            });
          }

          if (row.special_review_required === undefined) {
            errors.push({
              row: index + 1,
              error: "Special review required flag is required",
            });
          }

          if (!row.reviewer_name) {
            errors.push({
              row: index + 1,
              error: "Reviewer name is required",
            });
          }

          if (
            !row.review_status ||
            !Object.values(ReviewStatus).includes(row.review_status)
          ) {
            errors.push({
              row: index + 1,
              error:
                "Valid review status is required (pending, approved, rejected)",
            });
          }

          if (!row.review_timestamp) {
            errors.push({
              row: index + 1,
              error: "Review timestamp is required",
            });
          }

          if (
            !row.overall_validation_status ||
            !Object.values(OverallValidationStatus).includes(
              row.overall_validation_status
            )
          ) {
            errors.push({
              row: index + 1,
              error:
                "Valid overall validation status is required (approved, rejected)",
            });
          }

          if (!row.last_overall_validation_date) {
            errors.push({
              row: index + 1,
              error: "Last overall validation date is required",
            });
          }

          if (!row.updated_by) {
            errors.push({
              row: index + 1,
              error: "Updated by is required",
            });
          }

          // Return data formatted for upload
          return {
            submission_id: row.submission_id?.trim(),
            special_review_required:
              row.special_review_required?.toLowerCase() === "true",
            reviewer_name: row.reviewer_name?.trim(),
            review_status: row.review_status?.trim(),
            review_timestamp: row.review_timestamp?.trim(),
            review_rejection_reason: row.review_rejection_reason?.trim(),
            overall_validation_status: row.overall_validation_status?.trim(),
            last_overall_validation_date:
              row.last_overall_validation_date?.trim(),
            updated_by: row.updated_by?.trim(),
            notes: row.notes?.trim(),
          };
        });

        resolve({
          data,
          dataToUpload: errors.length === 0 ? dataToUpload : [],
          errors,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
