import { prisma } from "@/lib/prisma";
import {
  visa_status,
  country_id_type,
  country_id_status,
} from "@prisma/client";

export const getAllVisaDetails = async () => {
  return prisma.visa_detail.findMany({
    include: {
      contractor: true,
    },
  });
};

export const getVisaDetailById = async (id: string) => {
  return prisma.visa_detail.findUnique({
    where: { visa_detail_id: id },
    include: {
      contractor: true,
    },
  });
};

export const createVisaDetail = async (data: {
  contractor_id: string;
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
}) => {
  return prisma.visa_detail.create({
    data: {
      contractor: { connect: { contractor_id: data.contractor_id } },
      visa_number: data.visa_number,
      visa_type: data.visa_type,
      visa_country: data.visa_country,
      visa_expiry_date: new Date(data.visa_expiry_date),
      visa_status: data.visa_status,
      visa_sponsor: data.visa_sponsor,
      country_id_number: data.country_id_number,
      country_id_type: data.country_id_type,
      country_id_expiry_date: new Date(data.country_id_expiry_date),
      country_id_status: data.country_id_status,
    },
  });
};

export const updateVisaDetail = async (id: string, data: any) => {
  return prisma.visa_detail.update({
    where: { visa_detail_id: id },
    data: {
      ...data,
      ...(data.visa_expiry_date && {
        visa_expiry_date: new Date(data.visa_expiry_date),
      }),
      ...(data.country_id_expiry_date && {
        country_id_expiry_date: new Date(data.country_id_expiry_date),
      }),
    },
  });
};

export const deleteVisaDetail = async (id: string) => {
  return prisma.visa_detail.delete({
    where: { visa_detail_id: id },
  });
};
