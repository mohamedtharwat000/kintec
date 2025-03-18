import { z } from "zod";
import { Expense, ExpenseType, ExpenseFrequency } from "@/types/Expense";

export const expenseSchema = z.object({
  PO_id: z.string().optional(),
  CWO_id: z.string().optional(),
  expense_type: z.nativeEnum(ExpenseType),
  expense_frequency: z.nativeEnum(ExpenseFrequency),
  expense_value: z.number().or(z.string().transform(Number)),
  expsense_currency: z.string().min(1, "Currency is required"),
  pro_rata_percentage: z.number().or(z.string().transform(Number)).optional(),
});

export type ExpenseValidation = z.infer<typeof expenseSchema>;

export function validateExpense(
  data: Partial<Expense>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = expenseSchema.safeParse(row);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        validationErrors.push({
          row: rowNumber,
          error: `${err.path}: ${err.message}`,
        });
      });
    }
  });

  return validationErrors;
}
