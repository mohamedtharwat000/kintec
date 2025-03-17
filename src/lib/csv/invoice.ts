import Papa from "papaparse";
import { Invoice } from "@/types/Invoice";
import { validateInvoice } from "@/lib/validation/invoice";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseInvoice(
  file: File
): Promise<ParseResult<Partial<Invoice>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Invoice>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateInvoice(processedData);
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
