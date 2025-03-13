import { Review } from "@/types/Review";

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
  validation_rules?: SubmissionValidationRule[];
  reviews?: Review[];
}

export interface SubmissionValidationRule {
  sub_val_rule_id: string;
  submission_id: string;
  approval_signature_rules?: string;
  approval_date_rules?: string;
  required_fields?: RequiredFields;
  template_requirements?: string;
  workday_definitions?: string;
}

export enum RequiredFields {
  REG = "REG",
  EXP = "EXP",
}
