import Papa from "papaparse";
import { SubmissionValidationRule } from "@/types/SubmissionValidationRule";
import { validateSubmissionValidationRules } from "@/lib/validation/submissionValidationRule";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseSubmissionValidationRule(
  file: File
): Promise<ParseResult<Partial<SubmissionValidationRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<SubmissionValidationRule>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors =
          validateSubmissionValidationRules(processedData);
        resolve({
          data: processedData,
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
