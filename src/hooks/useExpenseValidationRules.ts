import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseValidationRule } from "@/types/Expense";

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

export function useExpenseValidationRule(id: string) {
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

export function useCreateExpenseValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRule: Partial<ExpenseValidationRule>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<ExpenseValidationRule>(
          "/api/exp_validation_rules",
          newRule
        );
        return data;
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
