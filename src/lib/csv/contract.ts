import Papa from "papaparse";
import { Contract } from "@/types/Contract";
import { validateContracts } from "@/lib/validation/contract";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: unknown[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseContract(
  file: File
): Promise<ParseResult<Partial<Contract>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Contract>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "Job Title": "job_title",
          "Job Type": "job_type",
          "Job Number": "job_number",
          "Start Date": "contract_start_date",
          "End Date": "contract_end_date",
          "Cost Centre": "kintec_cost_centre_code",
          Status: "contract_status",
          Description: "description_of_services",
          "Contractor ID": "contractor_id",
          "Company ID": "client_company_id",
          "Project ID": "project_id",
        };

        return headerMap[header] || header;
      },
      transform: (value, field) => {
        if (field === "contract_start_date" || field === "contract_end_date") {
          if (!value) return "";
          try {
            const date = new Date(value);
            return date.toISOString();
          } catch (e) {
            return value;
          }
        }
        return value;
      },
      complete: (results) => {
        const processedData = results.data;
        const { validationErrors, validData } =
          validateContracts(processedData);

        resolve({
          data: processedData,
          dataToUpload: validData,
          errors: validationErrors,
          meta: results.meta,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
