import axiosClient from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ClientCompany } from "@/types/client";
import { Contractor } from "@/types/contractor";
import { Invoice } from "@/types/contract";

export function useClients() {
  return useQuery<ClientCompany[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ clients: ClientCompany[] }>(
        "/api/clients"
      );
      return data.clients;
    },
  });
}

export function useEmployees() {
  return useQuery<Contractor[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ contractors: Contractor[] }>(
        "/api/contractors"
      );
      return data.contractors;
    },
  });
}

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ invoices: Invoice[] }>(
        "/api/invoices"
      );
      return data.invoices;
    },
  });
}
