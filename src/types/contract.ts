export interface Contract {
  contract_id: string;
  contractor_id: string;
  client_company_id: string;
  contract_start_date: string;
  contract_end_date: string;
  job_title: string;
  job_type: string;
  contract_status: string;
  purchase_orders: PurchaseOrder[];
}

export interface PurchaseOrder {
  PO_id: string;
  PO_start_date: string;
  PO_end_date: string;
  contract_id: string;
  PO_total_value: number;
  PO_status: string;
  kintec_email_for_remittance: string;
  invoice: Invoice;
  rate: Rate;
}

export interface Invoice {
  invoice_id: string;
  PO_id: string;
  billing_period: string;
  invoice_status: string;
  invoice_total_value: number;
  invoice_currency: string;
}

export interface Rate {
  rate_id: string;
  PO_id: string;
  rate_type: string;
  rate_frequency: string;
  rate_value: number;
  rate_currency: string;
}
