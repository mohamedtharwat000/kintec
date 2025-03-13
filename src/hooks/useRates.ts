import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Rate } from "@/types/Rate";

export function useRates() {
  return useQuery<Rate[]>({
    queryKey: ["rates"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Rate[]>("/api/rates");
      return data;
    },
  });
}

export function useRate(id: string) {
  return useQuery<Rate>({
    queryKey: ["rates", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Rate>(`/api/rates/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRatesByPO(poId: string) {
  return useQuery<Rate[]>({
    queryKey: ["rates", "po", poId],
    queryFn: async () => {
      const { data } = await axiosClient.get<Rate[]>(`/api/rates?poId=${poId}`);
      return data;
    },
    enabled: !!poId,
  });
}

export function useRatesByCWO(cwoId: string) {
  return useQuery<Rate[]>({
    queryKey: ["rates", "cwo", cwoId],
    queryFn: async () => {
      const { data } = await axiosClient.get<Rate[]>(
        `/api/rates?cwoId=${cwoId}`
      );
      return data;
    },
    enabled: !!cwoId,
  });
}

export function useCreateRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRate: Partial<Rate>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Rate>("/api/rates", newRate);
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
      if (data.PO_id) {
        queryClient.invalidateQueries({
          queryKey: ["rates", "po", data.PO_id],
        });
      }
      if (data.CWO_id) {
        queryClient.invalidateQueries({
          queryKey: ["rates", "cwo", data.CWO_id],
        });
      }
    },
  });
}

export function useUpdateRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Rate> }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRate } = await axiosClient.put<Rate>(
          `/api/rates/${id}`,
          data
        );
        return updatedRate;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
      queryClient.invalidateQueries({ queryKey: ["rates", variables.id] });
      if (variables.data.PO_id) {
        queryClient.invalidateQueries({
          queryKey: ["rates", "po", variables.data.PO_id],
        });
      }
      if (variables.data.CWO_id) {
        queryClient.invalidateQueries({
          queryKey: ["rates", "cwo", variables.data.CWO_id],
        });
      }
    },
  });
}

export function useDeleteRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/rates/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
    },
  });
}

export function useBulkCreateRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRates: Partial<Rate>[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Rate[]>("/api/rates", newRates);
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });

      // Extract unique PO and CWO IDs for invalidation
      const poIds = new Set<string>();
      const cwoIds = new Set<string>();

      data.forEach((rate) => {
        if (rate.PO_id) poIds.add(rate.PO_id);
        if (rate.CWO_id) cwoIds.add(rate.CWO_id);
      });

      poIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ["rates", "po", id] });
      });

      cwoIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ["rates", "cwo", id] });
      });
    },
  });
}
