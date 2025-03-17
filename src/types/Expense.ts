import { expense, expense_validation_rule } from "@prisma/client";

export type Expense = expense;

export type ExpenseView = Expense & {
  validation_rules?: expense_validation_rule[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIExpenseData = MakePropertyOptional<Expense, "expense_id">;

export enum ExpenseType {
  charged = "charged",
  paid = "paid",
}

export enum ExpenseFrequency {
  hourly = "hourly",
  monthly = "monthly",
  daily = "daily",
}
