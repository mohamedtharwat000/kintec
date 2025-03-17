import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CWO_Rule, APICWORuleData } from "@/types/CWORule";
import { parseCWORule } from "@/lib/csv/cwoRule";

export function useCwoRules() {
  return useQuery<CWO_Rule[]>({
    queryKey: ["cwoRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<CWO_Rule[]>("/api/cwo_rules");
      return data;
    },
  });
}

export function useCwoRule(id?: string) {
  return useQuery<CWO_Rule>({
    queryKey: ["cwoRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<CWO_Rule>(`/api/cwo_rules/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCwoRulesByCwoId(cwoId?: string) {
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

export function useCreateCwoRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRules: APICWORuleData | APICWORuleData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<CWO_Rule[]>(
          "/api/cwo_rules",
          newRules
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRules) ? result.data! : result.data![0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cwoRules"] });
      if (!Array.isArray(data) && data.CWO_id) {
        queryClient.invalidateQueries({
          queryKey: ["cwoRules", "cwo", data.CWO_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["calloffWorkOrders"] });
    },
  });
}

export function useParseCwoRuleCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseCWORule(file);
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
