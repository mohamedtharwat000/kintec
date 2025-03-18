import { z } from "zod";
import { Contract, ContractStatus } from "@/types/Contract";

export const contractSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  job_type: z.string().min(1, "Job type is required"),
  job_number: z.string().min(1, "Job number is required"),
  contract_start_date: z.string().min(1, "Start date is required"),
  contract_end_date: z.string().min(1, "End date is required"),
  kintec_cost_centre_code: z.string().min(1, "Cost centre code is required"),
  description_of_services: z.string().optional(),
  contract_status: z.nativeEnum(ContractStatus).default(ContractStatus.active),
  contractor_id: z.string().optional(),
  client_company_id: z.string().optional(),
  project_id: z.string().optional(),
});

export type ContractValidation = z.infer<typeof contractSchema>;

export function validateContracts(
  data: Partial<Contract>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = contractSchema.safeParse(row);

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
