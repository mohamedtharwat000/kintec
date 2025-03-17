import { prisma } from "@/lib/prisma";
import {
  ClientCompany,
  ClientCompanyView,
  APIClientCompanyData,
} from "@/types/ClientCompany";

export const getAllClientCompanies = async (): Promise<ClientCompanyView[]> => {
  return prisma.client_company.findMany({
    include: {
      contracts: true,
    },
  });
};

export const getClientCompanyById = async (
  id: string
): Promise<ClientCompanyView | null> => {
  return prisma.client_company.findUnique({
    where: { client_company_id: id },
    include: {
      contracts: true,
    },
  });
};

export const deleteClientCompany = async (
  id: string
): Promise<ClientCompany> => {
  return prisma.client_company.delete({
    where: { client_company_id: id },
  });
};

export const updateClientCompany = async (
  id: string,
  data: Partial<ClientCompany>
): Promise<ClientCompany> => {
  return prisma.client_company.update({
    where: { client_company_id: id },
    data,
  });
};

export const createClientCompany = async (
  data: APIClientCompanyData | APIClientCompanyData[]
): Promise<ClientCompany[]> => {
  const receivedData: APIClientCompanyData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((company) => {
      if (company.client_company_id === "")
        company.client_company_id = undefined;

      console.log(company);

      return prisma.client_company.create({
        data: company,
      });
    })
  );
};
