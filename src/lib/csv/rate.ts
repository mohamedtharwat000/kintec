import Papa from "papaparse";
import { Rate } from "@/types/Rate";
import { validateRate } from "@/lib/validation/rate";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseRate(file: File): Promise<ParseResult<Partial<Rate>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Rate>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateRate(processedData);
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
