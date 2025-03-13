import Papa from "papaparse";
import { CalloffWorkOrder } from "@/types/Orders";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseCalloffWorkOrder(
  file: File
): Promise<ParseResult<Partial<CalloffWorkOrder>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<CalloffWorkOrder>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "CWO ID": "CWO_id",
          "Start Date": "CWO_start_date",
          "End Date": "CWO_end_date",
          "Contract ID": "contract_id",
          "Total Value": "CWO_total_value",
          Status: "CWO_status",
          "Remittance Email": "kintec_email_for_remittance",
        };

        return headerMap[header] || header;
      },
      transform: (value, field) => {
        if (field === "CWO_start_date" || field === "CWO_end_date") {
          if (!value) return "";
          try {
            const date = new Date(value);
            return date.toISOString();
          } catch (e) {
            return value;
          }
        }

        if (field === "CWO_total_value") {
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
