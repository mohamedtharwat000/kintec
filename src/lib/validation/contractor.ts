import { z } from "zod";
import { Contractor } from "@/types/Contractor";

export const contractorSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  email_address: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  country_of_residence: z.string().min(1, "Country of residence is required"),
});

export type ContractorValidation = z.infer<typeof contractorSchema>;

export function validateContractors(
  data: Partial<Contractor>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = contractorSchema.safeParse(row);

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
