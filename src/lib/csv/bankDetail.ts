import Papa from "papaparse";
import { BankDetail } from "@/types/BankDetail";
import { validateBankDetails } from "@/lib/validation/bankDetail";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: unknown[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseBankDetail(
  file: File
): Promise<ParseResult<Partial<BankDetail>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<BankDetail>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data.map((row: any) => {
          return {
            ...row,
            bank_detail_validated:
              row.bank_detail_validated?.toUpperCase() === "TRUE"
                ? true
                : row.bank_detail_validated?.toUpperCase() === "FALSE"
                ? false
                : undefined,
            bank_detail_type: row.bank_detail_type?.toLowerCase() || "primary",
          };
        });

        const { validationErrors, validData } =
          validateBankDetails(processedData);

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
