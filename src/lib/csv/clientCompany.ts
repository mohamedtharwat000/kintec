import Papa from "papaparse";
import { ClientCompany } from "@/types/ClientCompany";
import { validateClientCompanies } from "@/lib/validation/clientCompany";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: unknown[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseClientCompany(
  file: File
): Promise<ParseResult<Partial<ClientCompany>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<ClientCompany>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const { validationErrors, validData } =
          validateClientCompanies(processedData);
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
