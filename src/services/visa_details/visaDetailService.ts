import { prisma } from "@/lib/prisma";
import {
  VisaDetail,
  VisaDetailView,
  APIVisaDetailData,
} from "@/types/VisaDetail";

export const getAllVisaDetails = async (): Promise<VisaDetailView[]> => {
  return prisma.visa_detail.findMany({
    include: {
      contractor: true,
    },
  });
};

export const getVisaDetailById = async (
  id: string
): Promise<VisaDetailView | null> => {
  return prisma.visa_detail.findUnique({
    where: { visa_detail_id: id },
    include: {
      contractor: true,
    },
  });
};

export const deleteVisaDetail = async (id: string): Promise<VisaDetail> => {
  return prisma.visa_detail.delete({
    where: { visa_detail_id: id },
  });
};

export const updateVisaDetail = async (
  id: string,
  data: Partial<VisaDetail>
): Promise<VisaDetail> => {
  return prisma.visa_detail.update({
    where: { visa_detail_id: id },
    data,
  });
};

export const createVisaDetail = async (
  data: APIVisaDetailData | APIVisaDetailData[]
): Promise<VisaDetail[]> => {
  const receivedData: APIVisaDetailData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((visaDetail) => {
      if (visaDetail.visa_detail_id === "")
        visaDetail.visa_detail_id = undefined;

      return prisma.visa_detail.create({
        data: visaDetail,
      });
    })
  );
};
