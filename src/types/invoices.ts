export interface Invoice {
  id: number;
  client: string;
  amount: number;
  date: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
}
