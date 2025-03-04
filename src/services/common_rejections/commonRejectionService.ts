import { prisma } from "@/lib/prisma";
import { common_rejection_type } from "@prisma/client";

export const getAllCommonRejections = async () => {
  return prisma.common_rejection.findMany();
};

export const getCommonRejectionById = async (id: string) => {
  return prisma.common_rejection.findUnique({
    where: { common_rejection_id: id },
  });
};

export const createCommonRejection = async (data: {
  common_rejection_type: common_rejection_type;
  resolution_process: string;
}) => {
  return prisma.common_rejection.create({
    data,
  });
};

export const createCommonRejections = async (
  data: Array<{
    common_rejection_type: common_rejection_type;
    resolution_process: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const commonRejections = [];

    for (const rejectionData of data) {
      const commonRejection = await prisma.common_rejection.create({
        data: rejectionData,
      });

      commonRejections.push(commonRejection);
    }

    return commonRejections;
  });
};


export const updateCommonRejection = async (id: string, data: any) => {
  return prisma.common_rejection.update({
    where: { common_rejection_id: id },
    data,
  });
};

export const deleteCommonRejection = async (id: string) => {
  return prisma.common_rejection.delete({
    where: { common_rejection_id: id },
  });
};
