import {
  invoice,
  invoice_formatting_rule,
  purchase_order,
  calloff_work_order,
} from "@prisma/client";

export type Invoice = invoice;

export type InvoiceView = Invoice & {
  formatting_rules?: invoice_formatting_rule[];
  purchase_order?: purchase_order;
  calloff_work_order?: calloff_work_order;
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIInvoiceData = MakePropertyOptional<Invoice, "invoice_id">;

export enum InvoiceStatus {
  pending = "pending",
  paid = "paid",
}

export enum InvoiceType {
  proforma = "proforma",
  sales = "sales",
}
