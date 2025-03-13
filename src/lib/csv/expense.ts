import Papa from "papaparse";
import { Expense } from "@/types/Expense";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseExpense(
  file: File
): Promise<ParseResult<Partial<Expense>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Expense>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "Expense Type": "expense_type",
          "Expense Frequency": "expense_frequency",
          "Expense Value": "expense_value",
          Currency: "expsense_currency",
          "Pro Rata Percentage": "pro_rata_percentage",
          "PO ID": "PO_id",
          "CWO ID": "CWO_id",
        };

        return headerMap[header] || header;
      },
      transform: (value, field) => {
        if (field === "expense_value") {
          return value ? parseFloat(value) : 0;
        }
        if (field === "pro_rata_percentage") {
          return value ? parseFloat(value) : 100;
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
