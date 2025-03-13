export interface VisaDetail {
  visa_detail_id: string;
  contractor_id: string;
  visa_number: string;
  visa_type: string;
  visa_country: string;
  visa_expiry_date: Date | string;
  visa_status: VisaStatus;
  visa_sponsor: string;
  country_id_number: string;
  country_id_type: CountryIdType;
  country_id_expiry_date: Date | string;
  country_id_status: CountryIdStatus;
  contractor?: {
    contractor_id: string;
    first_name: string;
    last_name: string;
  };
}

export enum VisaStatus {
  active = "active",
  revoked = "revoked",
  expired = "expired",
}

export enum CountryIdType {
  national_id = "national_id",
  passport = "passport",
  other = "other",
}

export enum CountryIdStatus {
  active = "active",
  revoked = "revoked",
  expired = "expired",
}
