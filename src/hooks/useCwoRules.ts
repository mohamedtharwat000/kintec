import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CWO_Rule } from "@/types/Orders";

export function useCwoRules() {
  return useQuery<CWO_Rule[]>({
    queryKey: ["cwoRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<CWO_Rule[]>("/api/cwo_rules");
      return data;
    },
  });
}

export function useCwoRule(id: string) {
  return useQuery<CWO_Rule>({
    queryKey: ["cwoRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<CWO_Rule>(`/api/cwo_rules/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCwoRulesByCwoId(cwoId: string) {
  return useQuery<CWO_Rule[]>({
    queryKey: ["cwoRules", "cwo", cwoId],
    queryFn: async () => {
      const { data } = await axiosClient.get<CWO_Rule[]>(
        `/api/cwo_rules?cwoId=${cwoId}`
      );
      return data;
    },
    enabled: !!cwoId,
  });
}

export function useCreateCwoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRule: Partial<CWO_Rule>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<CWO_Rule>(
          "/api/cwo_rules",
          newRule
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cwoRules"] });
      queryClient.invalidateQueries({
        queryKey: ["cwoRules", "cwo", data.CWO_id],
      });
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
    },
  });
}

export function useUpdateCwoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CWO_Rule>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRule } = await axiosClient.put<CWO_Rule>(
          `/api/cwo_rules/${id}`,
          data
        );
        return updatedRule;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cwoRules"] });
      queryClient.invalidateQueries({ queryKey: ["cwoRules", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["cwoRules", "cwo", data.CWO_id],
      });
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
    },
  });
}

export function useDeleteCwoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/cwo_rules/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cwoRules"] });
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
    },
  });
}
