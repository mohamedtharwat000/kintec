import { prisma } from "@/lib/prisma";
import {
  BankDetail,
  BankDetailView,
  APIBankDetailData,
} from "@/types/BankDetail";

export const getAllBankDetails = async (): Promise<BankDetailView[]> => {
  return prisma.bank_detail.findMany({
    include: {
      contractor: true,
    },
  });
};

export const getBankDetailById = async (
  id: string
): Promise<BankDetailView | null> => {
  return prisma.bank_detail.findUnique({
    where: { bank_detail_id: id },
    include: {
      contractor: true,
    },
  });
};

export const deleteBankDetail = async (id: string): Promise<BankDetail> => {
  return prisma.bank_detail.delete({
    where: { bank_detail_id: id },
  });
};

export const updateBankDetail = async (
  id: string,
  data: Partial<BankDetail>
): Promise<BankDetail> => {
  return prisma.bank_detail.update({
    where: { bank_detail_id: id },
    data: {
      ...data,
      last_updated: new Date(),
    },
  });
};

export const createBankDetail = async (
  data: APIBankDetailData | APIBankDetailData[]
): Promise<BankDetail[]> => {
  const receivedData: APIBankDetailData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((bankDetail) => {
      if (bankDetail.bank_detail_id === "")
        bankDetail.bank_detail_id = undefined;

      return prisma.bank_detail.create({
        data: {
          ...bankDetail,
          last_updated: new Date(),
        },
      });
    })
  );
};
