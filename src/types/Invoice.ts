import { CalloffWorkOrder, PurchaseOrder } from "@/types/Orders";

export interface Invoice {
  invoice_id: string;
  PO_id?: string;
  CWO_id?: string;
  billing_period: Date;
  invoice_status: InvoiceStatus;
  invoice_type: InvoiceType;
  invoice_total_value: number;
  invoice_currency: string;
  formatting_rules?: InvoiceFormattingRule[];
  wht_rate?: number;
  wht_applicable?: boolean;
  external_assignment?: boolean;
  purchase_order?: PurchaseOrder;
  calloff_work_order?: CalloffWorkOrder;
}

export enum InvoiceStatus {
  pending = "pending",
  paid = "paid",
}

export enum InvoiceType {
  proforma = "proforma",
  sales = "sales",
}

export interface InvoiceFormattingRule {
  inv_formatting_rule_id: string;
  invoice_id: string;
  file_format?: string;
  required_invoice_fields?: string;
  attachment_requirements?: string;
}
