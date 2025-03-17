import { z } from "zod";
import { ExpenseValidationRule } from "@/types/ExpenseValidationRule";

export const expenseValidationRuleSchema = z.object({
  expense_id: z.string().min(1, "Expense ID is required"),
  allowable_expense_types: z.string().optional(),
  expense_documentation: z.string().optional(),
  supporting_documentation_type: z.string().optional(),
  expense_limit: z.string().optional(),
  reimbursement_rule: z.string().optional(),
});

export type ExpenseValidationRuleValidation = z.infer<
  typeof expenseValidationRuleSchema
>;

export function validateExpenseValidationRules(
  data: Partial<ExpenseValidationRule>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = expenseValidationRuleSchema.safeParse(row);

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
