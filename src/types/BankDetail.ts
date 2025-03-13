import { Contractor } from "@/types/Contractor";

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
  contractor?: Contractor;
}

export enum BankDetailType {
  primary = "primary",
  secondary = "secondary",
}
