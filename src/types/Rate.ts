import { PurchaseOrder } from "@/types/Orders";
import { CalloffWorkOrder } from "@/types/Orders";

export enum RateType {
  charged = "charged",
  paid = "paid",
}

export enum RateFrequency {
  hourly = "hourly",
  daily = "daily",
  monthly = "monthly",
}

export interface Rate {
  rate_id: string;
  PO_id?: string;
  CWO_id?: string;
  rate_type: RateType;
  rate_frequency: RateFrequency;
  rate_value: number;
  rate_currency: string;
  purchase_order?: PurchaseOrder;
  calloff_work_order?: CalloffWorkOrder;
}
