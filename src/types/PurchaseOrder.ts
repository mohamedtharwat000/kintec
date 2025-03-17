import {
  purchase_order,
  contract,
  rate,
  invoice,
  expense,
  submission,
  RPO_rule,
} from "@prisma/client";

export type PurchaseOrder = purchase_order;

export type PurchaseOrderView = PurchaseOrder & {
  contract?: contract;
  rates?: rate[];
  RPO_rules?: RPO_rule[];
  invoices?: invoice[];
  expenses?: expense[];
  submissions?: submission[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIPurchaseOrderData = MakePropertyOptional<PurchaseOrder, "PO_id">;

export enum PO_Status {
  active = "active",
  cancelled = "cancelled",
  expired = "expired",
}

export type RPO_Rule = RPO_rule;
