import {
  calloff_work_order,
  contract,
  rate,
  invoice,
  expense,
  submission,
  CWO_rule,
} from "@prisma/client";

export type CalloffWorkOrder = calloff_work_order;

export type CalloffWorkOrderView = CalloffWorkOrder & {
  contract?: contract;
  rates?: rate[];
  CWO_rules?: CWO_rule[];
  invoices?: invoice[];
  expenses?: expense[];
  submissions?: submission[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APICalloffWorkOrderData = MakePropertyOptional<
  CalloffWorkOrder,
  "CWO_id"
>;

// Reuse PO_Status enum from PurchaseOrder.ts
import { PO_Status } from "./PurchaseOrder";
export { PO_Status };

export type CWO_Rule = CWO_rule;
