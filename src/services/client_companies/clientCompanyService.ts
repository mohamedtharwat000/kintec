import { prisma } from "@/lib/prisma";

export const getAllClientCompanies = async () => {
  return prisma.client_company.findMany({
    include: {
      contracts: true,
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

export const createClientCompany = async (data: {
  client_name: string;
  contact_email: string;
  invoice_submission_deadline?: string;
}) => {
  return prisma.client_company.create({
    data: {
      ...data,
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

export const createClientCompanies = async (
  data: Array<{
    client_name: string;
    contact_email: string;
    invoice_submission_deadline?: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const companies = [];

    for (const companyData of data) {
      const company = await prisma.client_company.create({
        data: {
          ...companyData,
        },
      });

      companies.push(company);
    }

    return companies;
  });
};
