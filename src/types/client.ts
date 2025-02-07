import { Contract } from "@/types/contract";

export interface ClientCompany {
  client_company_id: string;
  client_company_name: string;
  contact_email: string;
  contracts: Contract[];
}
