import { z } from "zod";
import { CalloffWorkOrder, PO_Status } from "@/types/CalloffWorkOrder";

export const calloffWorkOrderSchema = z.object({
  contract_id: z.string().min(1, "Contract ID is required"),
  CWO_start_date: z.string().min(1, "Start date is required"),
  CWO_end_date: z.string().min(1, "End date is required"),
  CWO_total_value: z.number().or(z.string().transform(Number)),
  CWO_status: z.nativeEnum(PO_Status).default(PO_Status.active),
  kintec_email_for_remittance: z.string().email("Valid email is required"),
});

export type CalloffWorkOrderValidation = z.infer<typeof calloffWorkOrderSchema>;

export function validateCalloffWorkOrders(
  data: Partial<CalloffWorkOrder>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = calloffWorkOrderSchema.safeParse(row);

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
