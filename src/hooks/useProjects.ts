import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project } from "@/types/Project";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Project[]>("/api/projects");
      return data;
    },
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Project>(`/api/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProjects: Partial<Project> | Partial<Project>[]) => {
      const projectsArray = Array.isArray(newProjects)
        ? newProjects
        : [newProjects];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Project[]>(
          "/api/projects",
          projectsArray
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
    },
  });
}
