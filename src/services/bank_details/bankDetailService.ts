import { prisma } from "@/lib/prisma";
import { BankDetailType } from "@/types/BankDetail";

export const createBankDetail = async (data: {
  contractor_id: string;
  bank_name: string;
  account_number: string;
  IBAN: string;
  SWIFT: string;
  currency: string;
  bank_detail_type: BankDetailType;
  bank_detail_validated?: boolean;
  last_updated?: Date | string;
}) => {
  return prisma.bank_detail.create({
    data: {
      contractor: { connect: { contractor_id: data.contractor_id } },
      bank_name: data.bank_name,
      account_number: data.account_number,
      IBAN: data.IBAN,
      SWIFT: data.SWIFT,
      currency: data.currency,
      bank_detail_type: data.bank_detail_type,
      bank_detail_validated: data.bank_detail_validated,
      last_updated: data.last_updated
        ? new Date(data.last_updated)
        : new Date(),
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

export const getAllBankDetails = async () => {
  return prisma.bank_detail.findMany({
    include: {
      contractor: true,
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
    bank_detail_type: BankDetailType;
    bank_detail_validated?: boolean;
    last_updated?: Date | string;
  }>
) => {
  const bankDetails = [];

  for (const bankData of data) {
    const bankDetail = await createBankDetail(bankData);
    bankDetails.push(bankDetail);
  }

  return bankDetails;
};
