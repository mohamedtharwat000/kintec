import Papa from "papaparse";
import { ProjectRule } from "@/types/ProjectRule";
import { validateProjectRules } from "@/lib/validation/projectRule";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

const transformBoolean = (value: string): boolean | string => {
  const lowerValue = value.toLowerCase().trim();
  if (lowerValue === "true" || lowerValue === "1" || lowerValue === "yes")
    return true;
  if (lowerValue === "false" || lowerValue === "0" || lowerValue === "no")
    return false;
  return value;
};

export function parseProjectRule(
  file: File
): Promise<ParseResult<Partial<ProjectRule>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<ProjectRule>>(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === "major_project_indicator") return transformBoolean(value);
        return value;
      },
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateProjectRules(processedData);
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
