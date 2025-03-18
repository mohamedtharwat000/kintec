import {
  contractor,
  bank_detail,
  visa_detail,
  contract,
  submission,
} from "@prisma/client";

export type Contractor = contractor;

export type ContractorView = Contractor & {
  bank_details?: bank_detail[];
  visa_details?: visa_detail[];
  contracts?: contract[];
  submissions?: submission[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIContractorData = MakePropertyOptional<
  Contractor,
  "contractor_id"
>;
