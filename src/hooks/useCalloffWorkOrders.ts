import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalloffWorkOrder,
  CalloffWorkOrderView,
  APICalloffWorkOrderData,
} from "@/types/CalloffWorkOrder";
import { parseCalloffWorkOrder } from "@/lib/csv/calloffWorkOrder";

export function useCalloffWorkOrders() {
  return useQuery<CalloffWorkOrderView[]>({
    queryKey: ["calloffWorkOrders"],
    queryFn: async () => {
      const { data } = await axiosClient.get<CalloffWorkOrderView[]>(
        "/api/calloff_work_orders"
      );
      return data;
    },
  });
}

export function useCalloffWorkOrder(id?: string) {
  return useQuery<CalloffWorkOrderView>({
    queryKey: ["calloffWorkOrders", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<CalloffWorkOrderView>(
        `/api/calloff_work_orders/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteCalloffWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/calloff_work_orders/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateCalloffWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CalloffWorkOrder>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedCwo } = await axiosClient.put<CalloffWorkOrder>(
          `/api/calloff_work_orders/${id}`,
          data
        );
        return updatedCwo;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["calloffWorkOrders", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useCreateCalloffWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newCwos: APICalloffWorkOrderData | APICalloffWorkOrderData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<CalloffWorkOrder[]>(
          "/api/calloff_work_orders",
          newCwos
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newCwos) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useParseCalloffWorkOrderCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseCalloffWorkOrder(file);
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
