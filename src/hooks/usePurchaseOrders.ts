import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PurchaseOrder } from "@/types/Orders";

export function usePurchaseOrders() {
  return useQuery<PurchaseOrder[]>({
    queryKey: ["purchaseOrders"],
    queryFn: async () => {
      const { data } = await axiosClient.get<PurchaseOrder[]>(
        "/api/purchase-orders"
      );
      return data;
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery<PurchaseOrder>({
    queryKey: ["purchaseOrders", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<PurchaseOrder>(
        `/api/purchase-orders/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPurchaseOrder: Partial<PurchaseOrder>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<PurchaseOrder>(
          "/api/purchase-orders",
          newPurchaseOrder
        );
        return data;
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
            `/api/purchase-orders/${id}`,
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

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/purchase-orders/${id}`);
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
