import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contract, ContractView, APIContractData } from "@/types/Contract";
import { parseContract } from "@/lib/csv/contract";

export function useContracts() {
  return useQuery<ContractView[]>({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ContractView[]>("/api/contracts");
      return data;
    },
  });
}

export function useContract(id?: string) {
  return useQuery<ContractView>({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ContractView>(
        `/api/contracts/${id}`
      );
      return data;
    },
    enabled: !!id,
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
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.id],
      });
    },
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContracts: APIContractData | APIContractData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Contract[]>(
          "/api/contracts",
          newContracts
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

export function useParseContractCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseContract(file);
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
