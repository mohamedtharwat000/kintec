import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Submission,
  SubmissionView,
  APISubmissionData,
} from "@/types/Submission";
import { parseSubmission } from "@/lib/csv/submission";

export function useSubmissions() {
  return useQuery<SubmissionView[]>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data } =
        await axiosClient.get<SubmissionView[]>("/api/submissions");
      return data;
    },
  });
}

export function useSubmission(id?: string) {
  return useQuery<SubmissionView>({
    queryKey: ["submissions", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<SubmissionView>(
        `/api/submissions/${id}`
      );
      return data;
    },
    enabled: !!id,
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

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Submission>;
    }) => {
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

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newSubmissions: APISubmissionData | APISubmissionData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Submission[]>(
          "/api/submissions",
          newSubmissions
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newSubmissions) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useParseSubmissionCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseSubmission(file);
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
