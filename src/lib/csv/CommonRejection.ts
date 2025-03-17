import Papa from "papaparse";
import { CommonRejection } from "@/types/CommonRejection";
import { validateCommonRejections } from "@/lib/validation/commonRejection";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseCommonRejection(
  file: File
): Promise<ParseResult<Partial<CommonRejection>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<CommonRejection>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateCommonRejections(processedData);
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
