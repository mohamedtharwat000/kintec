import { CWO_rule } from "@prisma/client";

export type CWO_Rule = CWO_rule;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APICWORuleData = MakePropertyOptional<CWO_Rule, "CWO_rule_id">;
