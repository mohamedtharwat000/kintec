import { expense_validation_rule } from "@prisma/client";

export type ExpenseValidationRule = expense_validation_rule;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIExpenseValidationRuleData = MakePropertyOptional<
  ExpenseValidationRule,
  "exp_val_rule_id"
>;
