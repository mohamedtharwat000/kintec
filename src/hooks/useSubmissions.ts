import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Submission } from "@/types/Submission";

export function useSubmissions() {
  return useQuery<Submission[]>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Submission[]>("/api/submissions");
      return data;
    },
  });
}

export function useSubmission(id: string) {
  return useQuery<Submission>({
    queryKey: ["submissions", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Submission>(
        `/api/submissions/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSubmission: any) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Submission>(
          "/api/submissions",
          newSubmission
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await tryCatch(async () => {
        const { data: updatedSubmission } = await axiosClient.put<Submission>(
          `/api/submissions/${id}`,
          data
        );
        return updatedSubmission;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["submissions", variables.id],
      });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/submissions/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}
