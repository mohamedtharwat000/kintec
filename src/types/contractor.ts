import { Contract } from "@/types/Contract";

export interface Contractor {
  contractor_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: Date;
  email_address: string;
  phone_number: string;
  nationality: string;
  address: string;
  country_of_residence: string;
  bank_details?: BankDetail[];
  visa_details?: VisaDetail[];
  contracts?: Contract[];
  submissions?: Submission[];
}

export interface BankDetail {
  bank_detail_id: string;
  contractor_id: string;
  bank_name: string;
  account_number: string;
  IBAN: string;
  SWIFT: string;
  currency: string;
  bank_detail_type: BankDetailType;
  bank_detail_validated?: boolean;
  last_updated: Date;
}

export enum BankDetailType {
  primary = "primary",
  secondary = "secondary",
}

export interface VisaDetail {
  visa_detail_id: string;
  contractor_id: string;
  visa_number: string;
  visa_type: string;
  visa_country: string;
  visa_expiry_date: Date;
  visa_status: VisaStatus;
  visa_sponsor: string;
  country_id_number: string;
  country_id_type: CountryIdType;
  country_id_expiry_date: Date;
  country_id_status: CountryIdStatus;
}

export enum VisaStatus {
  active = "active",
  revoked = "revoked",
  expired = "expired",
}

export enum CountryIdType {
  national_id = "national_id",
  passport = "passport",
  other = "other",
}

export enum CountryIdStatus {
  active = "active",
  revoked = "revoked",
  expired = "expired",
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

export interface Review {
  review_id: string;
  submission_id: string;
  special_review_required: boolean;
  reviewer_name: string;
  review_status: ReviewStatus;
  review_timestamp: Date;
  review_rejection_reason?: string;
  overall_validation_status: OverallValidationStatus;
  last_overall_validation_date: Date;
  updated_by: string;
  notes?: string;
}

export enum ReviewStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum OverallValidationStatus {
  approved = "approved",
  rejected = "rejected",
}
