import Papa from "papaparse";
import { Project } from "@/types/Project";
import { validateProjects } from "@/lib/validation/project";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export function parseProject(
  file: File
): Promise<ParseResult<Partial<Project>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Project>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const validationErrors = validateProjects(processedData);
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
