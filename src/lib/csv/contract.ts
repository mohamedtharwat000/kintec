import Papa from "papaparse";
import { Contract } from "@/types/Contract";
import { validateContracts } from "@/lib/validation/contract";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseContract(
  file: File
): Promise<ParseResult<Partial<Contract>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Contract>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateContracts(processedData);
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
