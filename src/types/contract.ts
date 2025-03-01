import { ClientCompany } from "@/types/ClientCompany";
import { Contractor } from "@/types/contractor";
import { Project } from "@/types/Project";

export interface Contract {
  contract_id: string;
  contractor_id: string;
  client_company_id: string;
  project_id: string;
  contract_start_date: Date;
  contract_end_date: Date;
  job_title: string;
  job_type: string;
  job_number: string;
  kintec_cost_centre_code: string;
  description_of_services?: string;
  contract_status: ContractStatus;
  PO_id?: string;
  contractor?: Contractor;
  client_company?: ClientCompany;
  project?: Project;
  purchase_order?: PurchaseOrder;
  calloff_work_orders?: CalloffWorkOrder[];
}

export enum ContractStatus {
  active = "active",
  terminated = "terminated",
  expired = "expired",
}

export interface PurchaseOrder {
  PO_id: string;
  PO_start_date: Date;
  PO_end_date: Date;
  contract_id: string;
  PO_total_value: number;
  PO_status: POStatus;
  kintec_email_for_remittance: string;
  rates?: Rate[];
  invoices?: Invoice[];
  rpo_rules?: RPORule[];
  expenses?: Expense[];
  submissions?: Submission[];
}

export enum POStatus {
  active = "active",
  cancelled = "cancelled",
  expired = "expired",
}

export interface CalloffWorkOrder {
  CWO_id: string;
  CWO_start_date: Date;
  CWO_end_date: Date;
  contract_id: string;
  CWO_total_value: number;
  CWO_status: POStatus;
  kintec_email_for_remittance: string;
  rates?: Rate[];
  invoices?: Invoice[];
  cwo_rules?: CWORule[];
  expenses?: Expense[];
  submissions?: Submission[];
}

export interface CWORule {
  CWO_rule_id: string;
  CWO_id: string;
  CWO_number_format?: string;
  final_invoice_label?: string;
  CWO_extension_handling?: string;
  mob_demob_fee_rules?: string;
}

export interface RPORule {
  RPO_rule_id: string;
  PO_id: string;
  RPO_number_format?: string;
  final_invoice_label?: string;
  RPO_extension_handling?: string;
  mob_demob_fee_rules?: string;
}

export interface Rate {
  rate_id: string;
  PO_id?: string;
  CWO_id?: string;
  rate_type: RateType;
  rate_frequency: RateFrequency;
  rate_value: number;
  rate_currency: string;
}

export enum RateType {
  charged = "charged",
  paid = "paid",
}

export enum RateFrequency {
  hourly = "hourly",
  monthly = "monthly",
  daily = "daily",
}

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

export interface Submission {
  submission_id: string;
  contractor_id: string;
  PO_id?: string;
  CWO_id?: string;
  billing_period: Date;
  payment_currency: string;
  invoice_currency: string;
  invoice_due_date: Date;
  wht_rate?: number;
  wht_applicable?: boolean;
  external_assignment?: boolean;
}
