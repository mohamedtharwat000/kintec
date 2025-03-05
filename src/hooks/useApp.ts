import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientCompany } from "@/types/ClientCompany";
import { Contractor } from "@/types/Contractor";
import { Contract } from "@/types/Contract";
import { Project } from "@/types/Project";

// Client Companies
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

// Contractors
export function useContractors() {
  return useQuery<Contractor[]>({
    queryKey: ["contractors"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Contractor[]>("/api/contractors");
      return data;
    },
  });
}

export function useContractor(id: string) {
  return useQuery<Contractor>({
    queryKey: ["contractors", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Contractor>(
        `/api/contractors/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newContractors:
        | Partial<Omit<Contractor, "contractor_id">>
        | Partial<Contractor>[]
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
        const { data: updatedContractors } = await axiosClient.put<
          Contractor[]
        >(`/api/contractors/${id}`, { contractor_id: id, ...data });
        return updatedContractors;
      });

      if (result.error) throw result.error;
      return result.data![0];
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

// Contracts
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
    mutationFn: async (newContract: Omit<Contract, "id">) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Contract>(
          "/api/contracts",
          newContract
        );
        return data;
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

// Projects
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Project[]>("/api/projects");
      return data;
    },
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Project>(`/api/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: Omit<Project, "id">) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Project>(
          "/api/projects",
          newProject
        );
        return data;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Project>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedProject } = await axiosClient.put<Project>(
          `/api/projects/${id}`,
          data
        );
        return updatedProject;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/projects/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
