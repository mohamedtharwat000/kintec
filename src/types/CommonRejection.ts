import { common_rejection } from "@prisma/client";

export type CommonRejection = common_rejection;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APICommonRejectionData = MakePropertyOptional<
  CommonRejection,
  "common_rejection_id"
>;

export enum CommonRejectionType {
  contractor = "contractor",
  client = "client",
}
