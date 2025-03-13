import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contract } from "@/types/Contract";

export function useContracts() {
  return useQuery<Contract[]>({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Contract[]>("/api/contracts");
      return data;
    },
  });
}

export function useContract(id: string) {
  return useQuery<Contract>({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Contract>(`/api/contracts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newContracts: Partial<Contract> | Partial<Contract>[]
    ) => {
      const contractsArray = Array.isArray(newContracts)
        ? newContracts
        : [newContracts];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Contract[]>(
          "/api/contracts",
          contractsArray
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newContracts) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Contract>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedContract } = await axiosClient.put<Contract>(
          `/api/contracts/${id}`,
          data
        );
        return updatedContract;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contracts", variables.id] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/contracts/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
