import { RPO_rule } from "@prisma/client";

export type RPO_Rule = RPO_rule;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIRPORuleData = MakePropertyOptional<RPO_Rule, "RPO_rule_id">;
