import { client_company, contract } from "@prisma/client";

export type ClientCompany = client_company;

export type ClientCompanyView = ClientCompany & {
  contracts?: contract[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIClientCompanyData = MakePropertyOptional<
  ClientCompany,
  "client_company_id"
>;
