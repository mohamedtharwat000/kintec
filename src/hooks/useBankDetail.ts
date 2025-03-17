import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BankDetail,
  BankDetailView,
  APIBankDetailData,
} from "@/types/BankDetail";
import { parseBankDetail } from "@/lib/csv/bankDetail";

export function useBankDetails() {
  return useQuery<BankDetailView[]>({
    queryKey: ["bankDetails"],
    queryFn: async () => {
      const { data } =
        await axiosClient.get<BankDetailView[]>("/api/bank_details");
      return data;
    },
  });
}

export function useBankDetail(id?: string) {
  return useQuery<BankDetailView>({
    queryKey: ["bankDetails", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<BankDetailView>(
        `/api/bank_details/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/bank_details/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useUpdateBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BankDetail>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedBankDetail } = await axiosClient.put<BankDetail>(
          `/api/bank_details/${id}`,
          data
        );
        return updatedBankDetail;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
      queryClient.invalidateQueries({
        queryKey: ["bankDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useCreateBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newBankDetails: APIBankDetailData | APIBankDetailData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<BankDetail[]>(
          "/api/bank_details",
          newBankDetails
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newBankDetails) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useParseBankDetailCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseBankDetail(file);
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
