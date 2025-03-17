import { z } from "zod";
import { Rate, RateType, RateFrequency } from "@/types/Rate";

export const rateSchema = z.object({
  PO_id: z.string().optional(),
  CWO_id: z.string().optional(),
  rate_type: z.nativeEnum(RateType),
  rate_frequency: z.nativeEnum(RateFrequency),
  rate_value: z.number().or(z.string().transform(Number)),
  rate_currency: z.string().min(1, "Currency is required"),
});

export type RateValidation = z.infer<typeof rateSchema>;

export function validateRate(
  data: Partial<Rate>[]
): { row: number; error: string }[] {
  const validationErrors: { row: number; error: string }[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = rateSchema.safeParse(row);

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
