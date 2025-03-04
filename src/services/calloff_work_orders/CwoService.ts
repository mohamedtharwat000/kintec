import { PO_status } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const getAllCwos = async () => {
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

export const getCwoById = async (id: string) => {
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

export const createCwo = async (data: {
  CWO_start_date: string;
  CWO_end_date: string;
  contract_id: string;
  CWO_total_value: Decimal;
  CWO_status: PO_status;
  kintec_email_for_remittance: string;
}) => {
  return prisma.calloff_work_order.create({
    data: {
      CWO_start_date: new Date(data.CWO_start_date),
      CWO_end_date: new Date(data.CWO_end_date),
      contract: { connect: { contract_id: data.contract_id } },
      CWO_total_value: data.CWO_total_value,
      CWO_status: data.CWO_status,
      kintec_email_for_remittance: data.kintec_email_for_remittance,
    },
  });
};

export const createCwos = async (
  data: Array<{
    CWO_start_date: string;
    CWO_end_date: string;
    contract_id: string;
    CWO_total_value: Decimal;
    CWO_status: PO_status;
    kintec_email_for_remittance: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const cwos = [];

    for (const cwoData of data) {
      const cwo = await prisma.calloff_work_order.create({
        data: {
          CWO_start_date: new Date(cwoData.CWO_start_date),
          CWO_end_date: new Date(cwoData.CWO_end_date),
          contract: { connect: { contract_id: cwoData.contract_id } },
          CWO_total_value: cwoData.CWO_total_value,
          CWO_status: cwoData.CWO_status,
          kintec_email_for_remittance: cwoData.kintec_email_for_remittance,
        },
      });

      cwos.push(cwo);
    }

    return cwos;
  });
};


export const updateCwo = async (id: string, data: any) => {
  const { CWO_start_date, CWO_end_date, contract_id, ...rest } = data;

  return prisma.calloff_work_order.update({
    where: { CWO_id: id },
    data: {
      ...rest,
      ...(CWO_start_date && { CWO_start_date: new Date(CWO_start_date) }),
      ...(CWO_end_date && { CWO_end_date: new Date(CWO_end_date) }),
      ...(contract_id && { contract: { connect: { contract_id } } }),
    },
  });
};

export const deleteCwo = async (id: string) => {
  return prisma.calloff_work_order.delete({
    where: { CWO_id: id },
  });
};
