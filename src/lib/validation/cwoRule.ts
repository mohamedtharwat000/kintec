import { z } from "zod";
import { CWO_Rule } from "@/types/CWORule";

export const cwoRuleSchema = z.object({
  CWO_id: z.string().min(1, "CWO ID is required"),
  CWO_number_format: z.string().optional(),
  final_invoice_label: z.string().optional(),
  CWO_extension_handling: z.string().optional(),
  mob_demob_fee_rules: z.string().optional(),
});

export type CWORuleValidation = z.infer<typeof cwoRuleSchema>;

export function validateCWORules(
  data: Partial<CWO_Rule>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = cwoRuleSchema.safeParse(row);

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
