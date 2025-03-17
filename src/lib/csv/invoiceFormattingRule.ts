import Papa from "papaparse";
import { InvoiceFormattingRule } from "@/types/InvoiceFormattingRule";
import { validateInvoiceFormattingRules } from "@/lib/validation/invoiceFormattingRule";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseInvoiceFormattingRule(
  file: File
): Promise<ParseResult<Partial<InvoiceFormattingRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<InvoiceFormattingRule>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateInvoiceFormattingRules(processedData);
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
