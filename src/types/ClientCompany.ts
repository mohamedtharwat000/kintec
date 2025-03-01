import { Contract } from "@/types/contract";

export interface ClientCompany {
  client_company_id: string;
  client_name: string;
  contact_email: string;
  invoice_submission_deadline?: string;
  contracts?: Contract[];
}
