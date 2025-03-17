import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense, ExpenseView, APIExpenseData } from "@/types/Expense";
import { parseExpense } from "@/lib/csv/expense";

export function useExpenses() {
  return useQuery<ExpenseView[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ExpenseView[]>("/api/expenses");
      return data;
    },
  });
}

export function useExpense(id?: string) {
  return useQuery<ExpenseView>({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ExpenseView>(
        `/api/expenses/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/expenses/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Expense>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedExpense } = await axiosClient.put<Expense>(
          `/api/expenses/${id}`,
          data
        );
        return updatedExpense;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.id] });
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpenses: APIExpenseData | APIExpenseData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Expense[]>(
          "/api/expenses",
          newExpenses
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newExpenses) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useParseExpenseCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseExpense(file);
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
