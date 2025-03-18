import { prisma } from "@/lib/prisma";
import { Contract, ContractView, APIContractData } from "@/types/ContractType";

export const getAllContracts = async (): Promise<Contract[]> => {
  return prisma.contract.findMany({
    include: {
      contractor: true,
      client_company: true,
      project: true,
      purchase_order: true,
      calloff_work_orders: true,
    },
  });
};

export const getContractById = async (id: string): Promise<Contract | null> => {
  return prisma.contract.findUnique({
    where: { contract_id: id },
    include: {
      contractor: true,
      client_company: true,
      project: true,
      purchase_order: true,
      calloff_work_orders: true,
    },
  });
};

export const deleteContract = async (id: string): Promise<Contract> => {
  return prisma.contract.delete({
    where: { contract_id: id },
  });
};

export const updateContract = async (
  id: string,
  data: Partial<Contract>
): Promise<Contract> => {
  return prisma.contract.update({
    where: { contract_id: id },
    data,
  });
};

export const createContract = async (
  data: APIContractData | APIContractData[]
): Promise<Contract[]> => {
  const receivedData: APIContractData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((contract) => {
      if (contract.contract_id === "") contract.contract_id = undefined;

      return prisma.contract.create({
        data: contract,
      });
    })
  );
};
