import Papa from "papaparse";
import { RPO_Rule } from "@/types/Orders";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseRpoRule(
  file: File
): Promise<ParseResult<Partial<RPO_Rule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<RPO_Rule>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "RPO Rule ID": "RPO_rule_id",
          "PO ID": "PO_id",
          "Number Format": "RPO_number_format",
          "Final Invoice Label": "final_invoice_label",
          "Extension Handling": "RPO_extension_handling",
          "Mob/Demob Fee Rules": "mob_demob_fee_rules",
        };

        return headerMap[header] || header;
      },
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
