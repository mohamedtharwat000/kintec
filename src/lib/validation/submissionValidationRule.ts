import { z } from "zod";
import {
  SubmissionValidationRule,
  RequiredFields,
} from "@/types/SubmissionValidationRule";

export const submissionValidationRuleSchema = z.object({
  submission_id: z.string().min(1, "Submission ID is required"),
  approval_signature_rules: z.string().optional(),
  approval_date_rules: z.string().optional(),
  required_fields: z.nativeEnum(RequiredFields).optional(),
  template_requirements: z.string().optional(),
  workday_definitions: z.string().optional(),
});

export type SubmissionValidationRuleValidation = z.infer<
  typeof submissionValidationRuleSchema
>;

export function validateSubmissionValidationRules(
  data: Partial<SubmissionValidationRule>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = submissionValidationRuleSchema.safeParse(row);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        validationErrors.push({
          row: rowNumber,
          error: `${err.path}: ${err.message}`,
        });
      });
    }
  });

  return validationErrors;
}
