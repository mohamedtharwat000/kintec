export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ClientsResponse {
  clients: Client[];
}
