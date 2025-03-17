import { z } from "zod";
import { InvoiceFormattingRule } from "@/types/InvoiceFormattingRule";

export const invoiceFormattingRuleSchema = z.object({
  invoice_id: z.string().min(1, "Invoice ID is required"),
  file_format: z.string().optional(),
  required_invoice_fields: z.string().optional(),
  attachment_requirements: z.string().optional(),
});

export type InvoiceFormattingRuleValidation = z.infer<
  typeof invoiceFormattingRuleSchema
>;

export function validateInvoiceFormattingRules(
  data: Partial<InvoiceFormattingRule>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = invoiceFormattingRuleSchema.safeParse(row);

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
