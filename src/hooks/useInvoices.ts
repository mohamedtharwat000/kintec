import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Invoice } from "@/types/Invoice";

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Invoice[]>("/api/invoices");
      return data;
    },
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Invoice>(`/api/invoices/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInvoice: Partial<Invoice>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Invoice>(
          "/api/invoices",
          newInvoice
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Invoice>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedInvoice } = await axiosClient.put<Invoice>(
          `/api/invoices/${id}`,
          data
        );
        return updatedInvoice;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/invoices/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
