import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectRule } from "@/types/Project";

export function useProjectRules() {
  return useQuery<ProjectRule[]>({
    queryKey: ["projectRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectRule[]>(
        "/api/project_rules"
      );
      return data;
    },
  });
}

export function useProjectRule(id: string) {
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

export function useCreateProjectRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newProjectRule: Partial<ProjectRule> | Array<Partial<ProjectRule>>
    ) => {
      const projectRulesArray = Array.isArray(newProjectRule)
        ? newProjectRule
        : [newProjectRule];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<ProjectRule[]>(
          "/api/project_rules",
          projectRulesArray
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newProjectRule) ? result.data! : result.data![0];
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
