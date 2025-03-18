import Papa from "papaparse";
import { Expense } from "@/types/Expense";
import { validateExpense } from "@/lib/validation/expense";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseExpense(
  file: File
): Promise<ParseResult<Partial<Expense>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Expense>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        processedData.forEach((row) => {
          if (row.pro_rata_percentage) {
            row.pro_rata_percentage = parseFloat(
              row.pro_rata_percentage.toString()
            );
          }
        });

        const validationErrors = validateExpense(processedData);
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
