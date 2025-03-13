import Papa from "papaparse";
import { CWO_Rule } from "@/types/Orders";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseCwoRule(
  file: File
): Promise<ParseResult<Partial<CWO_Rule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<CWO_Rule>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "CWO Rule ID": "CWO_rule_id",
          "CWO ID": "CWO_id",
          "Number Format": "CWO_number_format",
          "Final Invoice Label": "final_invoice_label",
          "Extension Handling": "CWO_extension_handling",
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
