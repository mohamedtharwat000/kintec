export interface Expense {
  expense_id: string;
  PO_id?: string;
  CWO_id?: string;
  expense_type: ExpenseType;
  expense_frequency: ExpenseFrequency;
  expense_value: number;
  expsense_currency: string;
  validation_rules?: ExpenseValidationRule[];
  pro_rata_percentage: number;
}

export enum ExpenseType {
  charged = "charged",
  paid = "paid",
}

export enum ExpenseFrequency {
  hourly = "hourly",
  monthly = "monthly",
  daily = "daily",
}

export interface ExpenseValidationRule {
  exp_val_rule_id: string;
  expense_id: string;
  allowable_expense_types?: string;
  expense_documentation?: string;
  supporting_documentation_type?: string;
  expense_limit?: string;
  reimbursement_rule?: string;
}
