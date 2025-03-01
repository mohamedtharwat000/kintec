import { Contract } from "@/types/contract";

export interface Project {
  project_id: string;
  project_name: string;
  project_type: string;
  contracts?: Contract[];
  project_rules?: ProjectRule[];
}

export interface ProjectRule {
  project_rule_id: string;
  project_id: string;
  special_project_rules?: string;
  project_rules_reviewer_name?: string;
  additional_review_process?: AdditionalReviewProcess;
  major_project_indicator?: boolean;
}

export enum AdditionalReviewProcess {
  required = "required",
  not_required = "not_required",
}
