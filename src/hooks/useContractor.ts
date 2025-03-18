import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Contractor,
  ContractorView,
  APIContractorData,
} from "@/types/Contractor";
import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { parseContractor } from "@/lib/csv/contractor";

export function useContractors() {
  return useQuery<ContractorView[]>({
    queryKey: ["contractors"],
    queryFn: async () => {
      const { data } =
        await axiosClient.get<ContractorView[]>("/api/contractors");
      return data;
    },
  });
}

export function useContractor(id?: string) {
  return useQuery<ContractorView>({
    queryKey: ["contractors", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ContractorView>(
        `/api/contractors/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/contractors/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useUpdateContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Contractor>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedContractor } = await axiosClient.put<Contractor>(
          `/api/contractors/${id}`,
          data
        );
        return updatedContractor;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({
        queryKey: ["contractors", variables.id],
      });
    },
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newContractors: APIContractorData | APIContractorData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Contractor[]>(
          "/api/contractors",
          newContractors
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newContractors) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useParseContractorCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseContractor(file);
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
