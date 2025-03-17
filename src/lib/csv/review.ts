import Papa from "papaparse";
import { Review } from "@/types/Review";
import { validateReview } from "@/lib/validation/review";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseReview(file: File): Promise<ParseResult<Partial<Review>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Review>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateReview(processedData);
        resolve({
          data: processedData,
          errors: validationErrors,
          meta: results.meta,
        });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}
