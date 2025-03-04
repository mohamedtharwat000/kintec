import { rate_type, rate_frequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getAllRates = async () => {
  const rates = await prisma.rate.findMany({
    include: {
      purchase_order: true,
      calloff_work_order: true,
    },
  });

  return rates.map((rate) => {
    if (rate.purchase_order) {
      const { calloff_work_order, ...rest } = rate;
      return rest;
    } else if (rate.calloff_work_order) {
      const { purchase_order, ...rest } = rate;
      return rest;
    }
    return rate;
  });
};

export const getRateById = async (id: string) => {
  const rate = await prisma.rate.findUnique({
    where: { rate_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
    },
  });

  if (!rate) return null;

  if (rate.purchase_order) {
    const { calloff_work_order, ...rest } = rate;
    return rest;
  } else if (rate.calloff_work_order) {
    const { purchase_order, ...rest } = rate;
    return rest;
  }
  return rate;
};

export const createRate = async (data: {
  PO_id?: string;
  CWO_id?: string;
  rate_type: rate_type;
  rate_frequency: rate_frequency;
  rate_value: number;
  rate_currency: string;
}) => {
  // Ensure that exactly one of PO_id or CWO_id is provided.
  if ((!data.PO_id && !data.CWO_id) || (data.PO_id && data.CWO_id)) {
    throw new Error("Exactly one of PO_id or CWO_id must be provided.");
  }

  return prisma.rate.create({
    data: {
      rate_type: data.rate_type,
      rate_frequency: data.rate_frequency,
      rate_value: data.rate_value,
      rate_currency: data.rate_currency,
      ...(data.PO_id
        ? { purchase_order: { connect: { PO_id: data.PO_id } } }
        : {}),
      ...(data.CWO_id
        ? { calloff_work_order: { connect: { CWO_id: data.CWO_id } } }
        : {}),
    },
  });
};

export const updateRate = async (
  id: string,
  data: {
    PO_id?: string;
    CWO_id?: string;
    rate_type?: rate_type;
    rate_frequency?: rate_frequency;
    rate_value?: number;
    rate_currency?: string;
  }
) => {
  if (data.PO_id !== undefined && data.CWO_id !== undefined) {
    throw new Error("Provide only one of PO_id or CWO_id.");
  }

  return prisma.rate.update({
    where: { rate_id: id },
    data: {
      ...(data.rate_type && { rate_type: data.rate_type }),
      ...(data.rate_frequency && { rate_frequency: data.rate_frequency }),
      ...(data.rate_value && { rate_value: data.rate_value }),
      ...(data.rate_currency && { rate_currency: data.rate_currency }),
      ...(data.PO_id !== undefined
        ? { purchase_order: { connect: { PO_id: data.PO_id } } }
        : {}),
      ...(data.CWO_id !== undefined
        ? { calloff_work_order: { connect: { CWO_id: data.CWO_id } } }
        : {}),
    },
  });
};

export const deleteRate = async (id: string) => {
  return prisma.rate.delete({
    where: { rate_id: id },
  });
};
