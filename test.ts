import Papa from "papaparse";
import { ClientCompany } from "@/types/ClientCompany";
import { readFileSync } from "fs";

export function parseClientCompany(
  file: Buffer
): Promise<Partial<ClientCompany>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<ClientCompany>(file.toString(), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          return reject(results.errors);
        }

        resolve(results.data);
      },
    });
  });
}

const buffer = readFileSync("./csvData/companiesData.csv");

const parsed = parseClientCompany(buffer);
