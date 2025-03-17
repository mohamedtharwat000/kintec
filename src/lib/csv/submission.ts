import Papa from "papaparse";
import { Submission } from "@/types/Submission";
import { validateSubmission } from "@/lib/validation/submission";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseSubmission(
  file: File
): Promise<ParseResult<Partial<Submission>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Submission>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateSubmission(processedData);
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
