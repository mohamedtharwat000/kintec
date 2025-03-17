import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExpenseValidationRule,
  APIExpenseValidationRuleData,
} from "@/types/ExpenseValidationRule";
import { parseExpenseValidationRule } from "@/lib/csv/expenseValidationRule";

export function useExpenseValidationRules() {
  return useQuery<ExpenseValidationRule[]>({
    queryKey: ["expenseValidationRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ExpenseValidationRule[]>(
        "/api/exp_validation_rules"
      );
      return data;
    },
  });
}

export function useExpenseValidationRule(id?: string) {
  return useQuery<ExpenseValidationRule>({
    queryKey: ["expenseValidationRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ExpenseValidationRule>(
        `/api/exp_validation_rules/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteExpenseValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/exp_validation_rules/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseValidationRules"] });
    },
  });
}

export function useUpdateExpenseValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ExpenseValidationRule>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRule } =
          await axiosClient.put<ExpenseValidationRule>(
            `/api/exp_validation_rules/${id}`,
            data
          );
        return updatedRule;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenseValidationRules"] });
      queryClient.invalidateQueries({
        queryKey: ["expenseValidationRules", variables.id],
      });
    },
  });
}

export function useCreateExpenseValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newRules: APIExpenseValidationRuleData | APIExpenseValidationRuleData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<ExpenseValidationRule[]>(
          "/api/exp_validation_rules",
          newRules
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRules) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseValidationRules"] });
    },
  });
}

export function useParseExpenseValidationRuleCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseExpenseValidationRule(file);
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
