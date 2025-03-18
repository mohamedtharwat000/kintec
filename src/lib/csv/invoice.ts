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
        processedData.forEach((row) => {
          if (row.wht_applicable)
            row.wht_applicable = row.wht_applicable.toString() === "true";
          if (row.external_assignment)
            row.external_assignment =
              row.external_assignment.toString() === "true";

          if (row.wht_rate) row.wht_rate = parseFloat(row.wht_rate.toString());
        });
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
