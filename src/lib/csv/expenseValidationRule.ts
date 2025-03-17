import Papa from "papaparse";
import { ExpenseValidationRule } from "@/types/ExpenseValidationRule";
import { validateExpenseValidationRules } from "@/lib/validation/expenseValidationRule";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseExpenseValidationRule(
  file: File
): Promise<ParseResult<Partial<ExpenseValidationRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<ExpenseValidationRule>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateExpenseValidationRules(processedData);
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
