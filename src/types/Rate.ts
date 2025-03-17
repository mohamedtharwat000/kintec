import { rate, purchase_order, calloff_work_order } from "@prisma/client";

export type Rate = rate;

export type RateView = Rate & {
  purchase_order?: purchase_order;
  calloff_work_order?: calloff_work_order;
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIRateData = MakePropertyOptional<Rate, "rate_id">;

export enum RateType {
  charged = "charged",
  paid = "paid",
}

export enum RateFrequency {
  hourly = "hourly",
  daily = "daily",
  monthly = "monthly",
}
