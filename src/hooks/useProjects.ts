import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project, ProjectView, APIProjectData } from "@/types/Project";
import { parseProject } from "@/lib/csv/project";

export function useProjects() {
  return useQuery<ProjectView[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectView[]>("/api/projects");
      return data;
    },
  });
}

export function useProject(id?: string) {
  return useQuery<ProjectView>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectView>(
        `/api/projects/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/projects/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Project>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedProject } = await axiosClient.put<Project>(
          `/api/projects/${id}`,
          data
        );
        return updatedProject;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProjects: APIProjectData | APIProjectData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Project[]>(
          "/api/projects",
          newProjects
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newProjects) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useParseProjectCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseProject(file);
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
