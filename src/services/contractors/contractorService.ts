import { prisma } from "@/lib/prisma";
import {
  bank_detail_type,
  country_id_status,
  country_id_type,
  visa_status,
} from "@prisma/client";

export const getAllContractors = async () => {
  return prisma.contractor.findMany();
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
    data: {
      ...data,
      date_of_birth: new Date(data.date_of_birth),
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
    bank_details?: {
      bank_name: string;
      account_number: string;
      IBAN: string;
      SWIFT: string;
      currency: string;
      bank_detail_type: bank_detail_type;
      bank_detail_validated?: boolean;
    };
    visa_details?: {
      visa_number: string;
      visa_type: string;
      visa_country: string;
      visa_expiry_date: string;
      visa_status: visa_status;
      visa_sponsor: string;
      country_id_number: string;
      country_id_type: country_id_type;
      country_id_expiry_date: string;
      country_id_status: country_id_status;
    };
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const contractors = [];

    for (const contractorData of data) {
      const { bank_details, visa_details, ...contractorInfo } = contractorData;

      const contractor = await prisma.contractor.create({
        data: {
          ...contractorInfo,
          date_of_birth: new Date(contractorInfo.date_of_birth),
        },
      });

      if (bank_details) {
        await prisma.bank_detail.create({
          data: {
            ...bank_details,
            contractor: {
              connect: { contractor_id: contractor.contractor_id },
            },
            last_updated: new Date(),
          },
        });
      }

      if (visa_details) {
        await prisma.visa_detail.create({
          data: {
            ...visa_details,
            contractor: {
              connect: { contractor_id: contractor.contractor_id },
            },
            visa_expiry_date: new Date(visa_details.visa_expiry_date),
            country_id_expiry_date: new Date(
              visa_details.country_id_expiry_date
            ),
          },
        });
      }

      contractors.push(contractor);
    }
    return contractors;
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
