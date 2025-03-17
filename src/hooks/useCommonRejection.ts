import { useMemo } from "react";
import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CommonRejection,
  APICommonRejectionData,
} from "@/types/CommonRejection";
import { parseCommonRejection } from "@/lib/csv/CommonRejection";

export function useCommonRejections() {
  return useQuery<CommonRejection[]>({
    queryKey: ["commonRejections"],
    queryFn: async () => {
      const { data } = await axiosClient.get<CommonRejection[]>(
        "/api/common_rejections"
      );
      return data;
    },
  });
}

export function useCommonRejection(id?: string) {
  return useQuery<CommonRejection>({
    queryKey: ["commonRejections", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<CommonRejection>(
        `/api/common_rejections/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteCommonRejection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/common_rejections/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commonRejections"] });
    },
  });
}

export function useUpdateCommonRejection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CommonRejection>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRejection } =
          await axiosClient.put<CommonRejection>(
            `/api/common_rejections/${id}`,
            data
          );
        return updatedRejection;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["commonRejections"] });
      queryClient.invalidateQueries({
        queryKey: ["commonRejections", variables.id],
      });
    },
  });
}

export function useCreateCommonRejection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newRejections: APICommonRejectionData | APICommonRejectionData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<CommonRejection[]>(
          "/api/common_rejections",
          newRejections
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRejections) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commonRejections"] });
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

export function useParseCommonRejectionCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseCommonRejection(file);
      return result;
    });
    if (error) return { error };
    return { data };
  };
}
