import Papa from "papaparse";
import { Submission } from "@/types/Submission";

export const parseSubmission = async (file: File) => {
  return new Promise<{
    data: any[];
    dataToUpload: any[];
    errors: { row: number; error: string }[];
  }>((resolve, reject) => {
    const errors: { row: number; error: string }[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const dataToUpload = data.map((row: any, index: number) => {
          // Basic validation
          if (!row.contractor_id) {
            errors.push({
              row: index + 1,
              error: "Contractor ID is required",
            });
          }

          // Validate that only one of PO_id or CWO_id is provided
          if ((!row.PO_id && !row.CWO_id) || (row.PO_id && row.CWO_id)) {
            errors.push({
              row: index + 1,
              error: "Exactly one of PO_id or CWO_id must be provided",
            });
          }

          if (!row.billing_period) {
            errors.push({
              row: index + 1,
              error: "Billing period is required",
            });
          }

          if (!row.payment_currency) {
            errors.push({
              row: index + 1,
              error: "Payment currency is required",
            });
          }

          if (!row.invoice_currency) {
            errors.push({
              row: index + 1,
              error: "Invoice currency is required",
            });
          }

          if (!row.invoice_due_date) {
            errors.push({
              row: index + 1,
              error: "Invoice due date is required",
            });
          }

          // Return data formatted for upload with proper types
          return {
            contractor_id: row.contractor_id?.trim(),
            PO_id: row.PO_id?.trim() || undefined,
            CWO_id: row.CWO_id?.trim() || undefined,
            billing_period: row.billing_period?.trim(),
            payment_currency: row.payment_currency?.trim(),
            invoice_currency: row.invoice_currency?.trim(),
            invoice_due_date: row.invoice_due_date?.trim(),
            wht_rate: row.wht_rate ? parseFloat(row.wht_rate) : undefined,
            wht_applicable: row.wht_applicable
              ? row.wht_applicable.toLowerCase() === "true"
              : undefined,
            external_assignment: row.external_assignment
              ? row.external_assignment.toLowerCase() === "true"
              : undefined,
          };
        });

        resolve({
          data,
          dataToUpload: errors.length === 0 ? dataToUpload : [],
          errors,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
