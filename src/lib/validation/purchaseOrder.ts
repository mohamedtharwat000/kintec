import { z } from "zod";
import { PurchaseOrder, PO_Status } from "@/types/PurchaseOrder";

export const purchaseOrderSchema = z.object({
  contract_id: z.string().min(1, "Contract ID is required"),
  PO_start_date: z.string().min(1, "Start date is required"),
  PO_end_date: z.string().min(1, "End date is required"),
  PO_total_value: z.number().or(z.string().transform(Number)),
  PO_status: z.nativeEnum(PO_Status).default(PO_Status.active),
  kintec_email_for_remittance: z.string().email("Valid email is required"),
});

export type PurchaseOrderValidation = z.infer<typeof purchaseOrderSchema>;

export function validatePurchaseOrders(
  data: Partial<PurchaseOrder>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = purchaseOrderSchema.safeParse(row);

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
