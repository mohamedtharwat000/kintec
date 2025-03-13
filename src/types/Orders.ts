import { Rate } from "@/types/Rate";
import { Invoice } from "@/types/Invoice";
import { Expense } from "@/types/Expense";
import { Submission } from "@/types/Submission";
import { Contract } from "@/types/Contract";

export enum PO_Status {
  active = "active",
  cancelled = "cancelled",
  expired = "expired",
}

export interface PurchaseOrder {
  PO_id: string;
  PO_start_date: Date;
  PO_end_date: Date;
  contract_id: string;
  PO_total_value: number;
  PO_status: PO_Status;
  kintec_email_for_remittance: string;
  contract?: Contract;
  rates?: Rate[];
  RPO_rules?: RPO_Rule[];
  invoices?: Invoice[];
  expenses?: Expense[];
  submissions?: Submission[];
}

export interface RPO_Rule {
  RPO_rule_id: string;
  PO_id: string;
  RPO_number_format?: string;
  final_invoice_label?: string;
  RPO_extension_handling?: string;
  mob_demob_fee_rules?: string;
  purchase_order?: PurchaseOrder;
}

export interface CalloffWorkOrder {
  CWO_id: string;
  CWO_start_date: Date;
  CWO_end_date: Date;
  contract_id: string;
  CWO_total_value: number;
  CWO_status: PO_Status;
  kintec_email_for_remittance: string;
  contract?: Contract;
  rates?: Rate[];
  CWO_rules?: CWO_Rule[];
  invoices?: Invoice[];
  expenses?: Expense[];
  submissions?: Submission[];
}

export interface CWO_Rule {
  CWO_rule_id: string;
  CWO_id: string;
  CWO_number_format?: string;
  final_invoice_label?: string;
  CWO_extension_handling?: string;
  mob_demob_fee_rules?: string;
  calloff_work_order?: CalloffWorkOrder;
}
