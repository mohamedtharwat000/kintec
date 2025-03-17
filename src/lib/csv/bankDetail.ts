import Papa from "papaparse";
import { BankDetail } from "@/types/BankDetail";
import { validateBankDetails } from "@/lib/validation/bankDetail";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseBankDetail(
  file: File
): Promise<ParseResult<Partial<BankDetail>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<BankDetail>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateBankDetails(processedData);
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
