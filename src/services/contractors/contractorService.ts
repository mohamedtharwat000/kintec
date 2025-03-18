import { prisma } from "@/lib/prisma";
import {
  Contractor,
  ContractorView,
  APIContractorData,
} from "@/types/ContractorType";

export const getAllContractors = async (): Promise<ContractorView[]> => {
  return prisma.contractor.findMany({
    include: {
      bank_details: true,
      visa_details: true,
      contracts: true,
      submissions: true,
    },
  });
};

export const getContractorById = async (
  id: string
): Promise<ContractorView | null> => {
  return prisma.contractor.findUnique({
    where: { contractor_id: id },
    include: {
      bank_details: true,
      visa_details: true,
      contracts: true,
      submissions: true,
    },
  });
};

export const deleteContractor = async (id: string): Promise<Contractor> => {
  return prisma.contractor.delete({
    where: { contractor_id: id },
  });
};

export const updateContractor = async (
  id: string,
  data: Partial<Contractor>
): Promise<Contractor> => {
  return prisma.contractor.update({
    where: { contractor_id: id },
    data,
  });
};

export const createContractor = async (
  data: APIContractorData | APIContractorData[]
): Promise<Contractor[]> => {
  const receivedData: APIContractorData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((contractor) => {
      if (contractor.contractor_id === "") contractor.contractor_id = undefined;

      return prisma.contractor.create({
        data: contractor,
      });
    })
  );
};
