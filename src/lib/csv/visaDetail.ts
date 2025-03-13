import Papa from "papaparse";
import { VisaDetail } from "@/types/VisaDetail";
import { validateVisaDetails } from "@/lib/validation/visaDetail";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: Partial<VisaDetail>[];
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
        const processedData = results.data.map((row: any) => {
          return {
            ...row,
            visa_status: row.visa_status?.toLowerCase() || "active",
            country_id_type: row.country_id_type?.toLowerCase() || "passport",
            country_id_status: row.country_id_status?.toLowerCase() || "active",
          };
        });

        const { validationErrors, validData } =
          validateVisaDetails(processedData);

        resolve({
          data: processedData,
          dataToUpload: validData,
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
