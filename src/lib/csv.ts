import Papa from "papaparse";
import { ClientCompany } from "@/types/ClientCompany";
import { Contractor } from "@/types/Contractor";

export interface ParseResult<T> {
  data: T[];
  dataToUpload?: unknown[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseClientCompany(
  file: File
): Promise<ParseResult<Partial<ClientCompany>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Partial<ClientCompany>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}

export function parseContractor(
  file: File
): Promise<ParseResult<Partial<Contractor>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const transformedData = results.data.map((item: any) => ({
          first_name: item.first_name,
          middle_name: item.middle_name,
          last_name: item.last_name,
          date_of_birth: item.date_of_birth,
          email_address: item.email_address,
          phone_number: item.phone_number,
          nationality: item.nationality,
          address: item.address,
          country_of_residence: item.country_of_residence,
          bank_details: item.bank_name
            ? {
                bank_name: item.bank_name,
                account_number: item.account_number,
                IBAN: item.IBAN,
                SWIFT: item.SWIFT,
                currency: item.currency,
                bank_detail_type: item.bank_detail_type,
                bank_detail_validated: item.bank_detail_validated === "TRUE",
              }
            : undefined,
          visa_details: item.visa_number
            ? {
                visa_number: item.visa_number,
                visa_type: item.visa_type,
                visa_country: item.visa_country,
                visa_expiry_date: item.visa_expiry_date,
                visa_status: item.visa_status,
                visa_sponsor: item.visa_sponsor,
                country_id_number: item.country_id_number,
                country_id_type: item.country_id_type,
                country_id_expiry_date: item.country_id_expiry_date,
                country_id_status: item.country_id_status,
              }
            : undefined,
        }));
        resolve({
          data: results.data,
          dataToUpload: transformedData,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}
