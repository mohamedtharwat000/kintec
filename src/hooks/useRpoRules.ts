import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RPO_Rule, APIRPORuleData } from "@/types/PORule";
import { parseRPORule } from "@/lib/csv/rpoRule";

export function useRpoRules() {
  return useQuery<RPO_Rule[]>({
    queryKey: ["rpoRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<RPO_Rule[]>("/api/rpo_rules");
      return data;
    },
  });
}

export function useRpoRule(id?: string) {
  return useQuery<RPO_Rule>({
    queryKey: ["rpoRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<RPO_Rule>(`/api/rpo_rules/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRpoRulesByPoId(poId?: string) {
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

export function useCreateRpoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRules: APIRPORuleData | APIRPORuleData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<RPO_Rule[]>(
          "/api/rpo_rules",
          newRules
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRules) ? result.data! : result.data![0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rpoRules"] });
      if (!Array.isArray(data) && data.PO_id) {
        queryClient.invalidateQueries({
          queryKey: ["rpoRules", "po", data.PO_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
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

export function useParseRpoRuleCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseRPORule(file);
      return result;
    });
    if (error) return { error };
    return { data };
  };
}
