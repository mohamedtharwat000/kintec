import { z } from "zod";
import { RPO_Rule } from "@/types/PORule";

export const rpoRuleSchema = z.object({
  PO_id: z.string().min(1, "PO ID is required"),
  RPO_number_format: z.string().optional(),
  final_invoice_label: z.string().optional(),
  RPO_extension_handling: z.string().optional(),
  mob_demob_fee_rules: z.string().optional(),
});

export type RPORuleValidation = z.infer<typeof rpoRuleSchema>;

export function validateRPORules(
  data: Partial<RPO_Rule>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = rpoRuleSchema.safeParse(row);

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
