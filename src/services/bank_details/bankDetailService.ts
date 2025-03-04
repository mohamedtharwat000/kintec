import { prisma } from "@/lib/prisma";
import { bank_detail_type } from "@prisma/client";

export const getAllBankDetails = async () => {
  return prisma.bank_detail.findMany({
    include: {
      contractor: true,
    },
  });
};

export const getBankDetailById = async (id: string) => {
  return prisma.bank_detail.findUnique({
    where: { bank_detail_id: id },
    include: {
      contractor: true,
    },
  });
};

export const createBankDetail = async (data: {
  contractor_id: string;
  bank_name: string;
  account_number: string;
  IBAN: string;
  SWIFT: string;
  currency: string;
  bank_detail_type: bank_detail_type;
  bank_detail_validated?: boolean;
}) => {
  return prisma.bank_detail.create({
    data: {
      contractor: { connect: { contractor_id: data.contractor_id } },
      bank_name: data.bank_name,
      account_number: data.account_number,
      IBAN: data.IBAN,
      SWIFT: data.SWIFT,
      currency: data.currency,
      bank_detail_type: data.bank_detail_type as bank_detail_type,
      bank_detail_validated: data.bank_detail_validated,
      last_updated: new Date(),
    },
  });
};

export const createBankDetails = async (
  data: Array<{
    contractor_id: string;
    bank_name: string;
    account_number: string;
    IBAN: string;
    SWIFT: string;
    currency: string;
    bank_detail_type: bank_detail_type;
    bank_detail_validated?: boolean;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const bankDetails = [];

    for (const bankData of data) {
      const bankDetail = await prisma.bank_detail.create({
        data: {
          contractor: { connect: { contractor_id: bankData.contractor_id } },
          bank_name: bankData.bank_name,
          account_number: bankData.account_number,
          IBAN: bankData.IBAN,
          SWIFT: bankData.SWIFT,
          currency: bankData.currency,
          bank_detail_type: bankData.bank_detail_type as bank_detail_type,
          bank_detail_validated: bankData.bank_detail_validated,
          last_updated: new Date(),
        },
      });

      bankDetails.push(bankDetail);
    }

    return bankDetails;
  });
};

export const updateBankDetail = async (id: string, data: any) => {
  return prisma.bank_detail.update({
    where: { bank_detail_id: id },
    data: {
      ...data,
      last_updated: new Date(),
    },
  });
};

export const deleteBankDetail = async (id: string) => {
  return prisma.bank_detail.delete({
    where: { bank_detail_id: id },
  });
};
