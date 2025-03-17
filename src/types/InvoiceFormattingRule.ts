import { invoice_formatting_rule } from "@prisma/client";

export type InvoiceFormattingRule = invoice_formatting_rule;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIInvoiceFormattingRuleData = MakePropertyOptional<
  InvoiceFormattingRule,
  "inv_formatting_rule_id"
>;
