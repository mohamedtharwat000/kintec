import Papa from "papaparse";
import { Contractor } from "@/types/Contractor";
import { validateContractors } from "@/lib/validation/contractor";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseContractor(
  file: File
): Promise<ParseResult<Partial<Contractor>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Contractor>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateContractors(processedData);
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
