import { z } from "zod";
import { Submission } from "@/types/Submission";

export const submissionSchema = z.object({
  contractor_id: z.string().min(1, "Contractor ID is required"),
  PO_id: z.string().optional(),
  CWO_id: z.string().optional(),
  billing_period: z.string().min(1, "Billing period is required"),
  payment_currency: z.string().min(1, "Payment currency is required"),
  invoice_currency: z.string().min(1, "Invoice currency is required"),
  invoice_due_date: z.string().min(1, "Due date is required"),
  wht_rate: z.number().or(z.string().transform(Number)).optional(),
  wht_applicable: z.boolean().optional(),
  external_assignment: z.boolean().optional(),
});

export type SubmissionValidation = z.infer<typeof submissionSchema>;

export function validateSubmission(
  data: Partial<Submission>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = submissionSchema.safeParse(row);

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
