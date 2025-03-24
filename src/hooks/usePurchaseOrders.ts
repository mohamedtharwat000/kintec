import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PurchaseOrder,
  PurchaseOrderView,
  APIPurchaseOrderData,
} from "@/types/PurchaseOrder";
import { parsePurchaseOrder } from "@/lib/csv/purchaseOrder";

export function usePurchaseOrders() {
  return useQuery<PurchaseOrderView[]>({
    queryKey: ["purchaseOrders"],
    queryFn: async () => {
      const { data } = await axiosClient.get<PurchaseOrderView[]>(
        "/api/purchase_orders"
      );
      return data;
    },
  });
}

export function usePurchaseOrder(id?: string) {
  return useQuery<PurchaseOrderView>({
    queryKey: ["purchaseOrders", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<PurchaseOrderView>(
        `/api/purchase-orders/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (po_id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/purchase_orders/${po_id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PurchaseOrder>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedPurchaseOrder } =
          await axiosClient.put<PurchaseOrder>(
            `/api/purchase_orders/${id}`,
            data
          );
        return updatedPurchaseOrder;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrders", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newPurchaseOrders: APIPurchaseOrderData | APIPurchaseOrderData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<PurchaseOrder[]>(
          "/api/purchase_orders",
          newPurchaseOrders
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newPurchaseOrders) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useParsePurchaseOrderCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parsePurchaseOrder(file);
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
