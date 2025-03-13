import { z } from "zod";
import { Project } from "@/types/Project";

export const projectSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  project_type: z.string().min(1, "Project type is required"),
});

export type ProjectValidation = z.infer<typeof projectSchema>;

export function validateProjects(data: Partial<Project>[]): {
  validationErrors: { row: number; error: string }[];
  validData: Partial<Project>[];
} {
  const validationErrors: { row: number; error: string }[] = [];
  const validData: Partial<Project>[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because of header row and 0-based index
    const result = projectSchema.safeParse(row);

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
