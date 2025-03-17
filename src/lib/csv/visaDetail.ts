import Papa from "papaparse";
import { VisaDetail } from "@/types/VisaDetail";
import { validateVisaDetails } from "@/lib/validation/visaDetail";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseVisaDetail(
  file: File
): Promise<ParseResult<Partial<VisaDetail>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<VisaDetail>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateVisaDetails(processedData);
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
