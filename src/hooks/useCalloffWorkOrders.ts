import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalloffWorkOrder } from "@/types/Orders";

export function useCalloffWorkOrders() {
  return useQuery<CalloffWorkOrder[]>({
    queryKey: ["calloffWorkOrders"],
    queryFn: async () => {
      const { data } = await axiosClient.get<CalloffWorkOrder[]>(
        "/api/calloff_work_orders"
      );
      return data;
    },
  });
}

export function useCalloffWorkOrder(id: string) {
  return useQuery<CalloffWorkOrder>({
    queryKey: ["calloffWorkOrders", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<CalloffWorkOrder>(
        `/api/calloff_work_orders/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCalloffWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCwo: Partial<CalloffWorkOrder>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<CalloffWorkOrder>(
          "/api/calloff_work_orders",
          newCwo
        );
        return data;
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
