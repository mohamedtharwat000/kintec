import Papa from "papaparse";
import { PurchaseOrder } from "@/types/Orders";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parsePurchaseOrder(
  file: File
): Promise<ParseResult<Partial<PurchaseOrder>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<PurchaseOrder>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "PO ID": "PO_id",
          "Start Date": "PO_start_date",
          "End Date": "PO_end_date",
          "Contract ID": "contract_id",
          "Total Value": "PO_total_value",
          Status: "PO_status",
          "Remittance Email": "kintec_email_for_remittance",
        };

        return headerMap[header] || header;
      },
      transform: (value, field) => {
        if (field === "PO_start_date" || field === "PO_end_date") {
          if (!value) return "";
          try {
            const date = new Date(value);
            return date.toISOString();
          } catch (e) {
            return value;
          }
        }

        if (field === "PO_total_value") {
          if (!value) return "";
          return parseFloat(value);
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
