import { PO_status } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const getAllPos = async () => {
  return prisma.purchase_order.findMany({
    include: {
      contract: true,
      rates: true,
      invoices: true,
      RPO_rules: true,
      expenses: true,
      submissions: true,
    },
  });
};

export const getPoById = async (id: string) => {
  return prisma.purchase_order.findUnique({
    where: { PO_id: id },
    include: {
      contract: true,
      rates: true,
      invoices: true,
      RPO_rules: true,
      expenses: true,
      submissions: true,
    },
  });
};

export const createPo = async (data: {
  PO_start_date: string;
  PO_end_date: string;
  contract_id: string;
  PO_total_value: Decimal;
  PO_status: PO_status;
  kintec_email_for_remittance: string;
}) => {
  return prisma.purchase_order.create({
    data: {
      PO_start_date: new Date(data.PO_start_date),
      PO_end_date: new Date(data.PO_end_date),
      contract: { connect: { contract_id: data.contract_id } },
      PO_total_value: data.PO_total_value,
      PO_status: data.PO_status,
      kintec_email_for_remittance: data.kintec_email_for_remittance,
    },
  });
};

export const updatePo = async (id: string, data: any) => {
  const { PO_start_date, PO_end_date, contract_id, ...rest } = data;

  return prisma.purchase_order.update({
    where: { PO_id: id },
    data: {
      ...rest,
      ...(PO_start_date && { PO_start_date: new Date(PO_start_date) }),
      ...(PO_end_date && { PO_end_date: new Date(PO_end_date) }),
      ...(contract_id && { contract: { connect: { contract_id } } }),
    },
  });
};

export const deletePo = async (id: string) => {
  return prisma.purchase_order.delete({
    where: { PO_id: id },
  });
};
