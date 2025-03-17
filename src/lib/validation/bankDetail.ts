import { z } from "zod";
import { BankDetail, BankDetailType } from "@/types/BankDetail";

export const bankDetailSchema = z.object({
  contractor_id: z.string().min(1, "Contractor ID is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  IBAN: z.string().min(1, "IBAN is required"),
  SWIFT: z.string().min(1, "SWIFT code is required"),
  currency: z.string().min(1, "Currency is required"),
  bank_detail_type: z
    .nativeEnum(BankDetailType)
    .default(BankDetailType.primary),
  bank_detail_validated: z.boolean().optional().default(false),
});

export type BankDetailValidation = z.infer<typeof bankDetailSchema>;

export function validateBankDetails(
  data: Partial<BankDetail>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = bankDetailSchema.safeParse(row);

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
