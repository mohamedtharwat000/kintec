import { prisma } from "@/lib/prisma";

export const getAllContractors = async () => {
  return prisma.contractor.findMany();
};

export const getContractorById = async (id: string) => {
  return prisma.contractor.findUnique({
    where: { contractor_id: id },
    include: { bank_details: true, visa_details: true },
  });
};

export const createContractor = async (data: {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string; // can be converted to Date inside the service
  email_address: string;
  phone_number: string;
  nationality: string;
  address: string;
  country_of_residence: string;
}) => {
  return prisma.contractor.create({
    data: {
      ...data,
      date_of_birth: new Date(data.date_of_birth),
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
