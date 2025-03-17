import { prisma } from "@/lib/prisma";
import {
  CommonRejection,
  APICommonRejectionData,
} from "@/types/CommonRejection";

export const getAllCommonRejections = async (): Promise<CommonRejection[]> => {
  return prisma.common_rejection.findMany();
};

export const getCommonRejectionById = async (
  id: string
): Promise<CommonRejection | null> => {
  return prisma.common_rejection.findUnique({
    where: { common_rejection_id: id },
  });
};

export const deleteCommonRejection = async (
  id: string
): Promise<CommonRejection> => {
  return prisma.common_rejection.delete({
    where: { common_rejection_id: id },
  });
};

export const updateCommonRejection = async (
  id: string,
  data: Partial<CommonRejection>
): Promise<CommonRejection> => {
  return prisma.common_rejection.update({
    where: { common_rejection_id: id },
    data,
  });
};

export const createCommonRejection = async (
  data: APICommonRejectionData | APICommonRejectionData[]
): Promise<CommonRejection[]> => {
  const receivedData: APICommonRejectionData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((rejection) => {
      if (rejection.common_rejection_id === "")
        rejection.common_rejection_id = undefined;

      return prisma.common_rejection.create({
        data: rejection,
      });
    })
  );
};
