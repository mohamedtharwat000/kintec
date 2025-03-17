import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectRule, APIProjectRuleData } from "@/types/ProjectRule";
import { parseProjectRule } from "@/lib/csv/projectRule";

export function useProjectRules() {
  return useQuery<ProjectRule[]>({
    queryKey: ["projectRules"],
    queryFn: async () => {
      const { data } =
        await axiosClient.get<ProjectRule[]>("/api/project_rules");
      return data;
    },
  });
}

export function useProjectRule(id?: string) {
  return useQuery<ProjectRule>({
    queryKey: ["projectRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectRule>(
        `/api/project_rules/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteProjectRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/project_rules/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectRules"] });
    },
  });
}

export function useUpdateProjectRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProjectRule>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedProjectRule } = await axiosClient.put<ProjectRule>(
          `/api/project_rules/${id}`,
          data
        );
        return updatedProjectRule;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectRules"] });
      queryClient.invalidateQueries({
        queryKey: ["projectRules", variables.id],
      });
    },
  });
}

export function useCreateProjectRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newProjectRules: APIProjectRuleData | APIProjectRuleData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<ProjectRule[]>(
          "/api/project_rules",
          newProjectRules
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newProjectRules) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectRules"] });
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

export function useParseProjectRuleCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseProjectRule(file);
      return result;
    });
    if (error) return { error };
    return { data };
  };
}
