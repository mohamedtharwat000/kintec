import { visa_detail, contractor } from "@prisma/client";

export type VisaDetail = visa_detail;

export type VisaDetailView = VisaDetail & {
  contractor?: contractor;
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIVisaDetailData = MakePropertyOptional<
  VisaDetail,
  "visa_detail_id"
>;

export enum VisaStatus {
  active = "active",
  revoked = "revoked",
  expired = "expired",
}

export enum CountryIdType {
  national_id = "national_id",
  passport = "passport",
  other = "other",
}

export enum CountryIdStatus {
  active = "active",
  revoked = "revoked",
  expired = "expired",
}
