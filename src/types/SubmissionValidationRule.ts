import { submission_validation_rule } from "@prisma/client";

export type SubmissionValidationRule = submission_validation_rule;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APISubmissionValidationRuleData = MakePropertyOptional<
  SubmissionValidationRule,
  "sub_val_rule_id"
>;

export enum RequiredFields {
  REG = "REG",
  EXP = "EXP",
}
