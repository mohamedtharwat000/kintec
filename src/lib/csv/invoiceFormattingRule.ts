import Papa from "papaparse";
import { InvoiceFormattingRule } from "@/types/Invoice";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseInvoiceFormattingRule(
  file: File
): Promise<ParseResult<Partial<InvoiceFormattingRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<InvoiceFormattingRule>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "Invoice ID": "invoice_id",
          "File Format": "file_format",
          "Required Fields": "required_invoice_fields",
          "Attachment Requirements": "attachment_requirements",
        };

        return headerMap[header] || header;
      },
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
