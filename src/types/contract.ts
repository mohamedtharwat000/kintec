import { ClientCompany } from "@/types/ClientCompany";
import { Contractor } from "@/types/Contractor";
import { Project } from "@/types/Project";
import { PurchaseOrder } from "@/types/Orders";
import { CalloffWorkOrder } from "@/types/Orders";

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
