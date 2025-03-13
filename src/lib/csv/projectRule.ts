import Papa from "papaparse";
import { ProjectRule, AdditionalReviewProcess } from "@/types/Project";
import { validateProjectRules } from "@/lib/validation/projectRule";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: unknown[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export async function parseProjectRule(
  file: File
): Promise<ParseResult<Partial<ProjectRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<ProjectRule>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data.map((row) => {
          if (typeof row.major_project_indicator === "string") {
            const upperValue = (
              row.major_project_indicator as string
            ).toUpperCase();
            row.major_project_indicator =
              upperValue === "TRUE"
                ? true
                : upperValue === "FALSE"
                ? false
                : undefined;
          }

          if (row.additional_review_process) {
            if (
              row.additional_review_process !== "required" &&
              row.additional_review_process !== "not_required"
            ) {
              row.additional_review_process = undefined;
            }
          }

          return {
            project_id: row.project_id?.trim(),
            special_project_rules: row.special_project_rules?.trim(),
            project_rules_reviewer_name:
              row.project_rules_reviewer_name?.trim(),
            additional_review_process: row.additional_review_process as
              | AdditionalReviewProcess
              | undefined,
            major_project_indicator: row.major_project_indicator,
          };
        });

        const { validationErrors, validData } =
          validateProjectRules(processedData);

        resolve({
          data: processedData,
          dataToUpload: validData,
          errors: validationErrors,
          meta: results.meta,
        });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}
