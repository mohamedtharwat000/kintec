import { prisma } from "@/lib/prisma";

export const createContractor = async (data: {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  email_address: string;
  phone_number: string;
  nationality: string;
  address: string;
  country_of_residence: string;
}) => {
  return prisma.contractor.create({
    data,
  });
};

export const getContractorById = async (id: string) => {
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

export const updateContractor = async (id: string, data: any) => {
  return prisma.contractor.update({
    where: { contractor_id: id },
    data,
  });
};

export const deleteContractor = async (id: string) => {
  return prisma.contractor.delete({
    where: { contractor_id: id },
  });
};

export const getAllContractors = async () => {
  return prisma.contractor.findMany({
    include: {
      bank_details: true,
      visa_details: true,
      contracts: true,
      submissions: true,
    },
  });
};

export const createContractors = async (
  data: Array<{
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    email_address: string;
    phone_number: string;
    nationality: string;
    address: string;
    country_of_residence: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const contractors = [];

    for (const contractorData of data) {
      const contractor = await prisma.contractor.create({
        data: contractorData,
      });

      contractors.push(contractor);
    }

    return contractors;
  });
};

export const updateContractorData = async (data: {
  contractor_id: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string;
  email_address?: string;
  phone_number?: string;
  nationality?: string;
  address?: string;
  country_of_residence?: string;
}) => {
  const { contractor_id, ...contractorInfo } = data;

  return prisma.contractor.update({
    where: { contractor_id },
    data: contractorInfo,
  });
};
