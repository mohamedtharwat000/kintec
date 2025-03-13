import { z } from "zod";
import { Contract, ContractStatus } from "@/types/Contract";

export const contractSchema = z.object({
  contractor_id: z.string().min(1, "Contractor is required"),
  client_company_id: z.string().min(1, "Client company is required"),
  project_id: z.string().min(1, "Project is required"),
  contract_start_date: z.date().or(z.string().min(1, "Start date is required")),
  contract_end_date: z.date().or(z.string().min(1, "End date is required")),
  job_title: z.string().min(1, "Job title is required"),
  job_type: z.string().min(1, "Job type is required"),
  job_number: z.string().min(1, "Job number is required"),
  kintec_cost_centre_code: z.string().min(1, "Cost centre code is required"),
  description_of_services: z.string().optional(),
  contract_status: z
    .nativeEnum(ContractStatus)
    .optional()
    .default(ContractStatus.active),
});

export type ContractValidation = z.infer<typeof contractSchema>;

export function validateContracts(data: Partial<Contract>[]): {
  validationErrors: { row: number; error: string }[];
  validData: Partial<Contract>[];
} {
  const validationErrors: { row: number; error: string }[] = [];
  const validData: Partial<Contract>[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index is 0-based and we're accounting for header row
    const result = contractSchema.safeParse(row);

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
