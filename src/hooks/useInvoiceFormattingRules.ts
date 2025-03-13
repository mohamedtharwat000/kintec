import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceFormattingRule } from "@/types/Invoice";

export function useInvoiceFormattingRules() {
  return useQuery<InvoiceFormattingRule[]>({
    queryKey: ["invoiceFormattingRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<InvoiceFormattingRule[]>(
        "/api/inv_formatting_rules"
      );
      return data;
    },
  });
}

export function useInvoiceFormattingRule(id: string) {
  return useQuery<InvoiceFormattingRule>({
    queryKey: ["invoiceFormattingRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<InvoiceFormattingRule>(
        `/api/inv_formatting_rules/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoiceFormattingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRule: Partial<InvoiceFormattingRule>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<InvoiceFormattingRule>(
          "/api/inv_formatting_rules",
          newRule
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceFormattingRules"] });
    },
  });
}

export function useUpdateInvoiceFormattingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InvoiceFormattingRule>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRule } =
          await axiosClient.put<InvoiceFormattingRule>(
            `/api/inv_formatting_rules/${id}`,
            data
          );
        return updatedRule;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoiceFormattingRules"] });
      queryClient.invalidateQueries({
        queryKey: ["invoiceFormattingRules", variables.id],
      });
    },
  });
}

export function useDeleteInvoiceFormattingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/inv_formatting_rules/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceFormattingRules"] });
    },
  });
}
