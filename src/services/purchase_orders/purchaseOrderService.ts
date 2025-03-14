import { prisma } from "@/lib/prisma";
import { PO_status } from "@prisma/client";

export const createPurchaseOrder = async (data: {
  PO_id?: string;
  contract_id: string;
  PO_start_date: string;
  PO_end_date: string;
  PO_total_value: number;
  PO_status: PO_status;
  kintec_email_for_remittance: string;
}) => {
  return prisma.purchase_order.create({
    data: {
      PO_id: data.PO_id || undefined,
      contract: { connect: { contract_id: data.contract_id } },
      PO_start_date: new Date(data.PO_start_date),
      PO_end_date: new Date(data.PO_end_date),
      PO_total_value: data.PO_total_value,
      PO_status: data.PO_status,
      kintec_email_for_remittance: data.kintec_email_for_remittance,
    },
    include: {
      contract: true,
      rates: true,
      RPO_rules: true,
    },
  });
};

export const getPurchaseOrderById = async (id: string) => {
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
    },
  });
};

export const updatePurchaseOrder = async (id: string, data: any) => {
  const { contract_id, PO_start_date, PO_end_date, ...rest } = data;

  return prisma.purchase_order.update({
    where: { PO_id: id },
    data: {
      ...rest,
      ...(contract_id && { contract: { connect: { contract_id } } }),
      ...(PO_start_date && { PO_start_date: new Date(PO_start_date) }),
      ...(PO_end_date && { PO_end_date: new Date(PO_end_date) }),
    },
    include: {
      contract: true,
      rates: true,
      RPO_rules: true,
    },
  });
};

export const deletePurchaseOrder = async (id: string) => {
  return prisma.purchase_order.delete({
    where: { PO_id: id },
  });
};

export const getAllPurchaseOrders = async () => {
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
    },
  });
};

export const getPurchaseOrdersByContractId = async (contractId: string) => {
  return prisma.purchase_order.findFirst({
    where: { contract_id: contractId },
    include: {
      contract: true,
      rates: true,
      RPO_rules: true,
    },
  });
};
