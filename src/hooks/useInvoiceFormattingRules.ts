import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  InvoiceFormattingRule,
  APIInvoiceFormattingRuleData,
} from "@/types/InvoiceFormattingRule";
import { parseInvoiceFormattingRule } from "@/lib/csv/invoiceFormattingRule";

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

export function useInvoiceFormattingRule(id?: string) {
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
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useCreateInvoiceFormattingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newRules: APIInvoiceFormattingRuleData | APIInvoiceFormattingRuleData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<InvoiceFormattingRule[]>(
          "/api/inv_formatting_rules",
          newRules
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRules) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceFormattingRules"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useParseInvoiceFormattingRuleCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseInvoiceFormattingRule(file);
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
