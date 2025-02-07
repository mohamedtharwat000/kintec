import { Contract } from "@/types/contract";

export interface Contractor {
  contractor_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  email_address: string;
  phone_number: string;
  nationality: string;
  address: string;
  country_of_residence: string;
  bank_details: BankDetail[];
  visa_details: VisaDetail[];
  contracts: Contract[];
}

export interface BankDetail {
  bank_detail_id: string;
  contractor_id: string;
  bank_name: string;
  account_number: string;
  IBAN: string;
  SWIFT: string;
  currency: string;
}

export interface VisaDetail {
  visa_detail_id: string;
  contractor_id: string;
  visa_number: string;
  visa_type: string;
  visa_country: string;
  visa_expiry_date: string;
  visa_status: string;
  visa_sponsor: string;
  country_id_number: string;
  country_id_type: string;
}
