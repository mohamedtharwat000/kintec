import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios";
import type { InvoicesResponse } from "@/types/invoices";
import type { ClientsResponse } from "@/types/clients";

export function useInvoices() {
  return useQuery<InvoicesResponse>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await axiosClient.get<InvoicesResponse>("/api/invoices");
      return data;
    },
  });
}

export function useClients() {
  return useQuery<ClientsResponse>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ClientsResponse>("/api/clients");
      return data;
    },
  });
}
