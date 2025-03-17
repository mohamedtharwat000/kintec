import { bank_detail, contractor } from "@prisma/client";

export type BankDetail = bank_detail;

export type BankDetailView = BankDetail & {
  contractor?: contractor;
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIBankDetailData = MakePropertyOptional<
  BankDetail,
  "bank_detail_id"
>;

export enum BankDetailType {
  primary = "primary",
  secondary = "secondary",
}
