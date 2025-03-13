import { z } from "zod";
import { ProjectRule, AdditionalReviewProcess } from "@/types/Project";

export const projectRuleSchema = z.object({
  project_id: z.string().min(1, "Project ID is required"),
  special_project_rules: z.string().optional(),
  project_rules_reviewer_name: z.string().optional(),
  additional_review_process: z.enum(["required", "not_required"]).optional(),
  major_project_indicator: z.boolean().optional(),
});

export type ProjectRuleValidation = z.infer<typeof projectRuleSchema>;

export function validateProjectRules(data: Partial<ProjectRule>[]): {
  validationErrors: { row: number; error: string }[];
  validData: Partial<ProjectRule>[];
} {
  const validationErrors: { row: number; error: string }[] = [];
  const validData: Partial<ProjectRule>[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = projectRuleSchema.safeParse(row);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        validationErrors.push({
          row: rowNumber,
          error: `${err.path}: ${err.message}`,
        });
      });
    } else {
      validData.push(row);
    }
  });

  return { validationErrors, validData };
}
