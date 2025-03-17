import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  VisaDetail,
  VisaDetailView,
  APIVisaDetailData,
} from "@/types/VisaDetail";
import { parseVisaDetail } from "@/lib/csv/visaDetail";

export function useVisaDetails() {
  return useQuery<VisaDetailView[]>({
    queryKey: ["visaDetails"],
    queryFn: async () => {
      const { data } =
        await axiosClient.get<VisaDetailView[]>("/api/visa_details");
      return data;
    },
  });
}

export function useVisaDetail(id?: string) {
  return useQuery<VisaDetailView>({
    queryKey: ["visaDetails", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<VisaDetailView>(
        `/api/visa_details/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteVisaDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/visa_details/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visaDetails"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useUpdateVisaDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VisaDetail>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedVisaDetail } = await axiosClient.put<VisaDetail>(
          `/api/visa_details/${id}`,
          data
        );
        return updatedVisaDetail;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visaDetails"] });
      queryClient.invalidateQueries({
        queryKey: ["visaDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useCreateVisaDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newVisaDetails: APIVisaDetailData | APIVisaDetailData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<VisaDetail[]>(
          "/api/visa_details",
          newVisaDetails
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newVisaDetails) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visaDetails"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useParseVisaDetailCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseVisaDetail(file);
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
