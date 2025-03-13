import Papa from "papaparse";
import { ExpenseValidationRule } from "@/types/Expense";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseExpenseValidationRule(
  file: File
): Promise<ParseResult<Partial<ExpenseValidationRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<ExpenseValidationRule>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "Expense ID": "expense_id",
          "Allowable Expense Types": "allowable_expense_types",
          "Expense Documentation": "expense_documentation",
          "Supporting Documentation Type": "supporting_documentation_type",
          "Expense Limit": "expense_limit",
          "Reimbursement Rule": "reimbursement_rule",
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
