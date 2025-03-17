import Papa from "papaparse";
import { CalloffWorkOrder } from "@/types/CalloffWorkOrder";
import { validateCalloffWorkOrders } from "@/lib/validation/calloffWorkOrder";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseCalloffWorkOrder(
  file: File
): Promise<ParseResult<Partial<CalloffWorkOrder>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<CalloffWorkOrder>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateCalloffWorkOrders(processedData);
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
