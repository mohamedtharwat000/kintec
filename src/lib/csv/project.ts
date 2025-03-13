import Papa from "papaparse";
import { Project } from "@/types/Project";
import { validateProjects } from "@/lib/validation/project";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: T[];
  errors: { row: number; error: string }[];
  meta: Papa.ParseMeta;
}

export const parseProject = async (
  file: File
): Promise<ParseResult<Partial<Project>>> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<Project>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data;
        const { validationErrors, validData } = validateProjects(processedData);

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
};
