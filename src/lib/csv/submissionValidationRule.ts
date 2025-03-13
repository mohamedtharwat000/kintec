import Papa from "papaparse";
import { RequiredFields } from "@/types/Submission";

export const parseSubmissionValidationRule = async (file: File) => {
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

          // Validate required_fields if provided
          if (
            row.required_fields &&
            !Object.values(RequiredFields).includes(row.required_fields)
          ) {
            errors.push({
              row: index + 1,
              error: "Invalid required_fields value, must be REG or EXP",
            });
          }

          // Return data formatted for upload
          return {
            submission_id: row.submission_id?.trim(),
            approval_signature_rules: row.approval_signature_rules?.trim(),
            approval_date_rules: row.approval_date_rules?.trim(),
            required_fields: row.required_fields?.trim() || undefined,
            template_requirements: row.template_requirements?.trim(),
            workday_definitions: row.workday_definitions?.trim(),
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
