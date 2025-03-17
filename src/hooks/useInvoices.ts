import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Invoice, InvoiceView, APIInvoiceData } from "@/types/Invoice";
import { parseInvoice } from "@/lib/csv/invoice";

export function useInvoices() {
  return useQuery<InvoiceView[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await axiosClient.get<InvoiceView[]>("/api/invoices");
      return data;
    },
  });
}

export function useInvoice(id?: string) {
  return useQuery<InvoiceView>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<InvoiceView>(
        `/api/invoices/${id}`
      );
      return data;
    },
    enabled: !!id,
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

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInvoices: APIInvoiceData | APIInvoiceData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Invoice[]>(
          "/api/invoices",
          newInvoices
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newInvoices) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useParseInvoiceCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseInvoice(file);
      return result;
    });
    if (error) return { error };
    return { data };
  };
}

export function useSearchFilter<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return data;

  const lowercaseSearchTerm = searchTerm.toLowerCase();

  return data.filter((item) =>
    searchFields.some((field) => {
      const fieldValue = item[field];
      return (
        fieldValue &&
        String(fieldValue).toLowerCase().includes(lowercaseSearchTerm)
      );
    })
  );
}
