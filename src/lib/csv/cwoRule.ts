import Papa from "papaparse";
import { CWO_Rule } from "@/types/CWORule";
import { validateCWORules } from "@/lib/validation/cwoRule";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseCWORule(
  file: File
): Promise<ParseResult<Partial<CWO_Rule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<CWO_Rule>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateCWORules(processedData);
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
