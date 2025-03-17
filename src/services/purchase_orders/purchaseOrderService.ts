import { prisma } from "@/lib/prisma";
import {
  PurchaseOrder,
  PurchaseOrderView,
  APIPurchaseOrderData,
} from "@/types/PurchaseOrder";

export const getAllPurchaseOrders = async (): Promise<PurchaseOrderView[]> => {
  return prisma.purchase_order.findMany({
    include: {
      contract: {
        include: {
          contractor: true,
          client_company: true,
        },
      },
      rates: true,
      RPO_rules: true,
      invoices: true,
      expenses: true,
      submissions: true,
    },
  });
};

export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrderView | null> => {
  return prisma.purchase_order.findUnique({
    where: { PO_id: id },
    include: {
      contract: {
        include: {
          contractor: true,
          client_company: true,
        },
      },
      rates: true,
      RPO_rules: true,
      invoices: true,
      expenses: true,
      submissions: true,
    },
  });
};

export const deletePurchaseOrder = async (
  id: string
): Promise<PurchaseOrder> => {
  return prisma.purchase_order.delete({
    where: { PO_id: id },
  });
};

export const updatePurchaseOrder = async (
  id: string,
  data: Partial<PurchaseOrder>
): Promise<PurchaseOrder> => {
  return prisma.purchase_order.update({
    where: { PO_id: id },
    data,
  });
};

export const createPurchaseOrder = async (
  data: APIPurchaseOrderData | APIPurchaseOrderData[]
): Promise<PurchaseOrder[]> => {
  const receivedData: APIPurchaseOrderData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((purchaseOrder) => {
      if (purchaseOrder.PO_id === "") purchaseOrder.PO_id = undefined;

      return prisma.purchase_order.create({
        data: purchaseOrder,
      });
    })
  );
};
