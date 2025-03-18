import {
  contract,
  contractor,
  client_company,
  project,
  purchase_order,
  calloff_work_order,
} from "@prisma/client";

export type Contract = contract;

export type ContractView = Contract & {
  contractor?: contractor;
  client_company?: client_company;
  project?: project;
  purchase_order?: purchase_order;
  calloff_work_orders?: calloff_work_order[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIContractData = MakePropertyOptional<Contract, "contract_id">;

export enum ContractStatus {
  active = "active",
  terminated = "terminated",
  expired = "expired",
}
