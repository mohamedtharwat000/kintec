import { submission, submission_validation_rule, review } from "@prisma/client";

export type Submission = submission;

export type SubmissionView = Submission & {
  validation_rules?: submission_validation_rule[];
  reviews?: review[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APISubmissionData = MakePropertyOptional<
  Submission,
  "submission_id"
>;
