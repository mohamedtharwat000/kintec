import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RPO_Rule } from "@/types/Orders";

export function useRpoRules() {
  return useQuery<RPO_Rule[]>({
    queryKey: ["rpoRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<RPO_Rule[]>("/api/rpo_rules");
      return data;
    },
  });
}

export function useRpoRule(id: string) {
  return useQuery<RPO_Rule>({
    queryKey: ["rpoRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<RPO_Rule>(`/api/rpo_rules/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRpoRulesByPoId(poId: string) {
  return useQuery<RPO_Rule[]>({
    queryKey: ["rpoRules", "po", poId],
    queryFn: async () => {
      const { data } = await axiosClient.get<RPO_Rule[]>(
        `/api/rpo_rules?poId=${poId}`
      );
      return data;
    },
    enabled: !!poId,
  });
}

export function useCreateRpoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRule: Partial<RPO_Rule>) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<RPO_Rule>(
          "/api/rpo_rules",
          newRule
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rpoRules"] });
      queryClient.invalidateQueries({
        queryKey: ["rpoRules", "po", data.PO_id],
      });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
}

export function useUpdateRpoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RPO_Rule>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRule } = await axiosClient.put<RPO_Rule>(
          `/api/rpo_rules/${id}`,
          data
        );
        return updatedRule;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rpoRules"] });
      queryClient.invalidateQueries({ queryKey: ["rpoRules", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["rpoRules", "po", data.PO_id],
      });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
}

export function useDeleteRpoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/rpo_rules/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rpoRules"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
}
