import { z } from "zod";
import { Project } from "@/types/Project";

export const projectSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  project_type: z.string().min(1, "Project type is required"),
});

export type ProjectValidation = z.infer<typeof projectSchema>;

export function validateProjects(
  data: Partial<Project>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = projectSchema.safeParse(row);

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
