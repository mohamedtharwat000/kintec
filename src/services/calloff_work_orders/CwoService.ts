import { prisma } from "@/lib/prisma";
import {
  CalloffWorkOrder,
  CalloffWorkOrderView,
  APICalloffWorkOrderData,
} from "@/types/CalloffWorkOrder";

export const getAllCwos = async (): Promise<CalloffWorkOrderView[]> => {
  return prisma.calloff_work_order.findMany({
    include: {
      contract: true,
      rates: true,
      invoices: true,
      CWO_rules: true,
      expenses: true,
      submissions: true,
    },
  });
};

export const getCwoById = async (
  id: string
): Promise<CalloffWorkOrderView | null> => {
  return prisma.calloff_work_order.findUnique({
    where: { CWO_id: id },
    include: {
      contract: true,
      rates: true,
      invoices: true,
      CWO_rules: true,
      expenses: true,
      submissions: true,
    },
  });
};

export const deleteCwo = async (id: string): Promise<CalloffWorkOrder> => {
  return prisma.calloff_work_order.delete({
    where: { CWO_id: id },
  });
};

export const updateCwo = async (
  id: string,
  data: Partial<CalloffWorkOrder>
): Promise<CalloffWorkOrder> => {
  return prisma.calloff_work_order.update({
    where: { CWO_id: id },
    data,
  });
};

export const createCwo = async (
  data: APICalloffWorkOrderData | APICalloffWorkOrderData[]
): Promise<CalloffWorkOrder[]> => {
  const receivedData: APICalloffWorkOrderData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((cwo) => {
      if (cwo.CWO_id === "") cwo.CWO_id = undefined;

      return prisma.calloff_work_order.create({
        data: cwo,
      });
    })
  );
};
