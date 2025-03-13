import { Contract } from "@/types/Contract";
import { BankDetail } from "@/types/BankDetail";
import { VisaDetail } from "@/types/VisaDetail";
import { Submission } from "@/types/Submission";

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
