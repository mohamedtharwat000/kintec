import { prisma } from "@/lib/prisma";
import { rate_type, rate_frequency } from "@prisma/client";

export const createRate = async (data: {
  PO_id?: string;
  CWO_id?: string;
  rate_type: rate_type;
  rate_frequency: rate_frequency;
  rate_value: number | string;
  rate_currency: string;
}) => {
  // Ensure either PO_id or CWO_id is provided, but not both
  if ((!data.PO_id && !data.CWO_id) || (data.PO_id && data.CWO_id)) {
    throw new Error("Either PO_id or CWO_id must be provided, but not both");
  }

  const rateData = {
    ...(data.PO_id && { purchase_order: { connect: { PO_id: data.PO_id } } }),
    ...(data.CWO_id && {
      calloff_work_order: { connect: { CWO_id: data.CWO_id } },
    }),
    rate_type: data.rate_type,
    rate_frequency: data.rate_frequency,
    rate_value:
      typeof data.rate_value === "string"
        ? parseFloat(data.rate_value)
        : data.rate_value,
    rate_currency: data.rate_currency,
  };

  return prisma.rate.create({
    data: rateData,
    include: {
      purchase_order: true,
      calloff_work_order: true,
    },
  });
};

export const getRateById = async (id: string) => {
  return prisma.rate.findUnique({
    where: { rate_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
    },
  });
};

export const updateRate = async (
  id: string,
  data: {
    rate_type?: rate_type;
    rate_frequency?: rate_frequency;
    rate_value?: number | string;
    rate_currency?: string;
    PO_id?: string;
    CWO_id?: string;
  }
) => {
  // Handle potential relation updates
  const updateData: any = { ...data };

  // Convert string rate value to number if provided
  if (typeof data.rate_value === "string") {
    updateData.rate_value = parseFloat(data.rate_value);
  }

  // Remove relation IDs from direct update
  delete updateData.PO_id;
  delete updateData.CWO_id;

  // Update relations if IDs are provided
  if (data.PO_id) {
    updateData.purchase_order = { connect: { PO_id: data.PO_id } };
    // Disconnect CWO if connecting to PO
    updateData.calloff_work_order = { disconnect: true };
  } else if (data.CWO_id) {
    updateData.calloff_work_order = { connect: { CWO_id: data.CWO_id } };
    // Disconnect PO if connecting to CWO
    updateData.purchase_order = { disconnect: true };
  }

  return prisma.rate.update({
    where: { rate_id: id },
    data: updateData,
    include: {
      purchase_order: true,
      calloff_work_order: true,
    },
  });
};

export const deleteRate = async (id: string) => {
  return prisma.rate.delete({
    where: { rate_id: id },
  });
};

export const getAllRates = async () => {
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

export const getRatesByPOId = async (poId: string) => {
  return prisma.rate.findMany({
    where: {
      PO_id: poId,
    },
    include: {
      purchase_order: true,
    },
  });
};

export const getRatesByCWOId = async (cwoId: string) => {
  return prisma.rate.findMany({
    where: {
      CWO_id: cwoId,
    },
    include: {
      calloff_work_order: true,
    },
  });
};

export const createBatchRates = async (
  rates: {
    PO_id?: string;
    CWO_id?: string;
    rate_type: rate_type;
    rate_frequency: rate_frequency;
    rate_value: number | string;
    rate_currency: string;
  }[]
) => {
  // Create each rate entry separately to handle the relationships correctly
  const createdRates = [];
  for (const rate of rates) {
    const createdRate = await createRate(rate);
    createdRates.push(createdRate);
  }
  return createdRates;
};
