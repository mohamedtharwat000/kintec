import { z } from "zod";
import { CommonRejection, CommonRejectionType } from "@/types/CommonRejection";

export const commonRejectionSchema = z.object({
  common_rejection_type: z.nativeEnum(CommonRejectionType),
  resolution_process: z.string().min(1, "Resolution process is required"),
});

export type CommonRejectionValidation = z.infer<typeof commonRejectionSchema>;

export function validateCommonRejections(
  data: Partial<CommonRejection>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = commonRejectionSchema.safeParse(row);

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
