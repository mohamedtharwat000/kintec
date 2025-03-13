import Papa from "papaparse";
import { Invoice } from "@/types/Invoice";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseInvoice(
  file: File
): Promise<ParseResult<Partial<Invoice>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Invoice>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "Billing Period": "billing_period",
          "Invoice Status": "invoice_status",
          "Invoice Type": "invoice_type",
          "Total Value": "invoice_total_value",
          Currency: "invoice_currency",
          "WHT Rate": "wht_rate",
          "WHT Applicable": "wht_applicable",
          "External Assignment": "external_assignment",
          "PO ID": "PO_id",
          "CWO ID": "CWO_id",
        };

        return headerMap[header] || header;
      },
      transform: (value, field) => {
        if (field === "billing_period") {
          if (!value) return "";
          try {
            const date = new Date(value);
            return date.toISOString();
          } catch (e) {
            return value;
          }
        }

        if (field === "invoice_total_value") {
          if (!value) return "";
          return parseFloat(value);
        }

        if (field === "wht_rate") {
          if (!value) return null;
          return parseFloat(value);
        }

        if (field === "wht_applicable" || field === "external_assignment") {
          if (value.toLowerCase() === "true") return true;
          if (value.toLowerCase() === "false") return false;
          return null;
        }

        return value;
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
