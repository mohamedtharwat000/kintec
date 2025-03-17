import { project_rule } from "@prisma/client";

export type ProjectRule = project_rule;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIProjectRuleData = MakePropertyOptional<
  ProjectRule,
  "project_rule_id"
>;

export enum AdditionalReviewProcess {
  required = "required",
  not_required = "not_required",
}
