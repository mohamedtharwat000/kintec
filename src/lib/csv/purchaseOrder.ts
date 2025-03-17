import Papa from "papaparse";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { validatePurchaseOrders } from "@/lib/validation/purchaseOrder";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parsePurchaseOrder(
  file: File
): Promise<ParseResult<Partial<PurchaseOrder>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<PurchaseOrder>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validatePurchaseOrders(processedData);
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
