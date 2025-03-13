import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BankDetail } from "@/types/BankDetail";

export function useBankDetails() {
  return useQuery<BankDetail[]>({
    queryKey: ["bankDetails"],
    queryFn: async () => {
      const { data } = await axiosClient.get<BankDetail[]>("/api/bank_details");
      return data;
    },
  });
}

export function useBankDetail(id: string) {
  return useQuery<BankDetail>({
    queryKey: ["bankDetails", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<BankDetail>(
        `/api/bank_details/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newBankDetails: Partial<BankDetail> | Partial<BankDetail>[]
    ) => {
      const bankDetailsArray = Array.isArray(newBankDetails)
        ? newBankDetails
        : [newBankDetails];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<BankDetail[]>(
          "/api/bank_details",
          bankDetailsArray
        );
        return data;
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
