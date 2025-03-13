import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contractor } from "@/types/Contractor";

export function useContractors() {
  return useQuery<Contractor[]>({
    queryKey: ["contractors"],
    queryFn: async () => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.get<Contractor[]>(
          "/api/contractors"
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
  });
}

export function useContractor(id: string) {
  return useQuery<Contractor>({
    queryKey: ["contractors", id],
    queryFn: async () => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.get<Contractor>(
          `/api/contractors/${id}`
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    enabled: !!id,
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newContractors: Partial<Contractor> | Partial<Contractor>[]
    ) => {
      const contractorsArray = Array.isArray(newContractors)
        ? newContractors
        : [newContractors];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Contractor[]>(
          "/api/contractors",
          contractorsArray
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
