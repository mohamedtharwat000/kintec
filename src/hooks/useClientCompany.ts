import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientCompany } from "@/types/ClientCompany";

export function useClients() {
  return useQuery<ClientCompany[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ClientCompany[]>(
        "/api/client_companies"
      );
      return data;
    },
  });
}

export function useClient(id: string) {
  return useQuery<ClientCompany>({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ClientCompany>(
        `/api/client_companies/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newClients: Partial<ClientCompany> | Partial<ClientCompany>[]
    ) => {
      const clientsArray = Array.isArray(newClients)
        ? newClients
        : [newClients];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<ClientCompany[]>(
          "/api/client_companies",
          clientsArray
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newClients) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClientCompany>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedClient } = await axiosClient.put<ClientCompany>(
          `/api/client_companies/${id}`,
          data
        );
        return updatedClient;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/client_companies/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
