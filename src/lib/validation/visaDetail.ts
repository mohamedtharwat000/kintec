import { z } from "zod";
import { VisaDetail } from "@/types/VisaDetail";

export const visaDetailSchema = z.object({
  contractor_id: z.string().min(1, "Contractor is required"),
  visa_number: z.string().min(1, "Visa number is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_country: z.string().min(1, "Country is required"),
  visa_expiry_date: z.string().min(1, "Expiry date is required"),
  visa_status: z.enum(["active", "revoked", "expired"]).default("active"),
  visa_sponsor: z.string().optional(),
  country_id_number: z.string().min(1, "ID number is required"),
  country_id_type: z
    .enum(["national_id", "passport", "other"])
    .default("passport"),
  country_id_expiry_date: z.string().min(1, "ID expiry date is required"),
  country_id_status: z.enum(["active", "revoked", "expired"]).default("active"),
});

export type VisaDetailValidation = z.infer<typeof visaDetailSchema>;

export function validateVisaDetails(data: Partial<VisaDetail>[]): {
  validationErrors: { row: number; error: string }[];
  validData: Partial<VisaDetail>[];
} {
  const validationErrors: { row: number; error: string }[] = [];
  const validData: Partial<VisaDetail>[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = visaDetailSchema.safeParse(row);

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
