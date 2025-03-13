import Papa from "papaparse";
import { Rate, RateType, RateFrequency } from "@/types/Rate";

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseRate(file: File): Promise<ParseResult<Partial<Rate>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Rate>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: Record<string, string> = {
          "PO ID": "PO_id",
          "CWO ID": "CWO_id",
          "Rate Type": "rate_type",
          "Rate Frequency": "rate_frequency",
          "Rate Value": "rate_value",
          Currency: "rate_currency",
        };

        return headerMap[header] || header;
      },
      transform: (value, field) => {
        if (field === "rate_type") {
          // Normalize rate type values
          const lowerValue = value.toLowerCase();
          if (lowerValue === "charged" || lowerValue === "paid") {
            return lowerValue;
          }
          return value;
        }

        if (field === "rate_frequency") {
          // Normalize rate frequency values
          const lowerValue = value.toLowerCase();
          if (["hourly", "daily", "monthly"].includes(lowerValue)) {
            return lowerValue;
          }
          return value;
        }

        if (field === "rate_value") {
          // Convert rate value to number
          if (!value) return "";
          try {
            return parseFloat(value);
          } catch (e) {
            return value;
          }
        }

        return value;
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
