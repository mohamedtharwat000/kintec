import { z } from "zod";
import { ClientCompany } from "@/types/ClientCompany";

export const clientCompanySchema = z.object({
  client_name: z.string().min(1, "Company name is required"),
  contact_email: z.string().email("Invalid email address"),
  invoice_submission_deadline: z.string().optional(),
});

export type ClientCompanyValidation = z.infer<typeof clientCompanySchema>;

export function validateClientCompanies(data: Partial<ClientCompany>[]): {
  validationErrors: { row: number; error: string }[];
  validData: Partial<ClientCompany>[];
} {
  const validationErrors: { row: number; error: string }[] = [];
  const validData: Partial<ClientCompany>[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = clientCompanySchema.safeParse(row);

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
