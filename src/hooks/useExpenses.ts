import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/types/Expense";

export function useExpenses() {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Expense[]>("/api/expenses");
      return data;
    },
  });
}

export function useExpense(id: string) {
  return useQuery<Expense>({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Expense>(`/api/expenses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpense: Partial<Expense>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Expense>(
          "/api/expenses",
          newExpense
        );
        return data;
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
