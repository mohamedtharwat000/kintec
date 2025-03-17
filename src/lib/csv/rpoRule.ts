import Papa from "papaparse";
import { RPO_Rule } from "@/types/PORule";
import { validateRPORules } from "@/lib/validation/rpoRule";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseRPORule(
  file: File
): Promise<ParseResult<Partial<RPO_Rule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<RPO_Rule>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateRPORules(processedData);
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
