import { prisma } from "@/lib/prisma";
import { Rate, RateView, APIRateData } from "@/types/Rate";

export const getAllRates = async (): Promise<Rate[]> => {
  return prisma.rate.findMany({
    include: {
      purchase_order: {
        include: {
          contract: true,
        },
      },
      calloff_work_order: {
        include: {
          contract: true,
        },
      },
    },
  });
};

export const getRateById = async (id: string): Promise<Rate | null> => {
  return prisma.rate.findUnique({
    where: { rate_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
    },
  });
};

export const getRatesByPOId = async (poId: string): Promise<Rate[]> => {
  return prisma.rate.findMany({
    where: {
      PO_id: poId,
    },
    include: {
      purchase_order: true,
    },
  });
};

export const getRatesByCWOId = async (cwoId: string): Promise<Rate[]> => {
  return prisma.rate.findMany({
    where: {
      CWO_id: cwoId,
    },
    include: {
      calloff_work_order: true,
    },
  });
};

export const deleteRate = async (id: string): Promise<Rate> => {
  return prisma.rate.delete({
    where: { rate_id: id },
  });
};

export const updateRate = async (
  id: string,
  data: Partial<Rate>
): Promise<Rate> => {
  return prisma.rate.update({
    where: { rate_id: id },
    data,
  });
};

export const createRate = async (
  data: APIRateData | APIRateData[]
): Promise<Rate[]> => {
  const receivedData: APIRateData[] = Array.isArray(data) ? data : [data];

  receivedData.forEach((rate) => {
    if ((!rate.PO_id && !rate.CWO_id) || (rate.PO_id && rate.CWO_id)) {
      throw new Error("Exactly one of PO_id or CWO_id must be provided.");
    }
  });

  return Promise.all(
    receivedData.map(async (rate) => {
      if (rate.rate_id === "") rate.rate_id = undefined;
      if (rate.PO_id === "") rate.PO_id = null;
      if (rate.CWO_id === "") rate.CWO_id = null;

      return prisma.rate.create({
        data: rate,
      });
    })
  );
};
