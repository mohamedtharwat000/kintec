import { z } from "zod";
import {
  VisaDetail,
  VisaStatus,
  CountryIdType,
  CountryIdStatus,
} from "@/types/VisaDetail";

export const visaDetailSchema = z.object({
  contractor_id: z.string().min(1, "Contractor is required"),
  visa_number: z.string().min(1, "Visa number is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_country: z.string().min(1, "Country is required"),
  visa_expiry_date: z.string().min(1, "Expiry date is required"),
  visa_status: z.nativeEnum(VisaStatus).default(VisaStatus.active),
  visa_sponsor: z.string().optional(),
  country_id_number: z.string().min(1, "ID number is required"),
  country_id_type: z.nativeEnum(CountryIdType).default(CountryIdType.passport),
  country_id_expiry_date: z.string().min(1, "ID expiry date is required"),
  country_id_status: z
    .nativeEnum(CountryIdStatus)
    .default(CountryIdStatus.active),
});

export type VisaDetailValidation = z.infer<typeof visaDetailSchema>;

export function validateVisaDetails(
  data: Partial<VisaDetail>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

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
    }
  });

  return validationErrors;
}
