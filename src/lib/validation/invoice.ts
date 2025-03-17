import { z } from "zod";
import { Invoice, InvoiceStatus, InvoiceType } from "@/types/Invoice";

export const invoiceSchema = z.object({
  PO_id: z.string().optional(),
  CWO_id: z.string().optional(),
  billing_period: z.string().min(1, "Billing period is required"),
  invoice_status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.pending),
  invoice_type: z.nativeEnum(InvoiceType),
  invoice_total_value: z.number().or(z.string().transform(Number)),
  invoice_currency: z.string().min(1, "Currency is required"),
  wht_rate: z.number().or(z.string().transform(Number)).optional(),
  wht_applicable: z.boolean().optional(),
  external_assignment: z.boolean().optional(),
});

export type InvoiceValidation = z.infer<typeof invoiceSchema>;

export function validateInvoice(
  data: Partial<Invoice>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = invoiceSchema.safeParse(row);

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
