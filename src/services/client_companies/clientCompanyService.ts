import { prisma } from "@/lib/prisma";
import { object } from "zod";

export const createClientCompany = async (data: {
  client_company_id?: string;
  client_name: string;
  contact_email: string;
  invoice_submission_deadline?: string;
}) => {
  return prisma.client_company.create({
    data: {
      ...data,
      client_company_id: data.client_company_id || undefined,
    },
  });
};

export const getClientCompanyById = async (id: string) => {
  return prisma.client_company.findUnique({
    where: { client_company_id: id },
    include: {
      contracts: true,
    },
  });
};

export const updateClientCompany = async (id: string, data: any) => {
  return prisma.client_company.update({
    where: { client_company_id: id },
    data,
  });
};

export const deleteClientCompany = async (id: string) => {
  return prisma.client_company.delete({
    where: { client_company_id: id },
  });
};

export const getAllClientCompanies = async () => {
  return prisma.client_company.findMany({
    include: {
      contracts: true,
    },
  });
};

export const createClientCompanies = async (
  data: Array<{
    client_company_id?: string;
    client_name: string;
    contact_email: string;
    invoice_submission_deadline?: string;
  }>
) => {
  const companies = [];

  for (const companyData of data) {
    const compData = { ...companyData, client_company_id: companyData.client_company_id || undefined, }
    const company = await createClientCompany(compData);
    companies.push(company);
  }

  return companies;
};
