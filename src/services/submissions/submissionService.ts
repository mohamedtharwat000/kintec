import { prisma } from "@/lib/prisma";
import {
  Submission,
  SubmissionView,
  APISubmissionData,
} from "@/types/Submission";

export const getAllSubmissions = async (): Promise<SubmissionView[]> => {
  return prisma.submission.findMany({
    include: {
      contractor: true,
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
      reviews: true,
    },
  });
};

export const getSubmissionById = async (
  id: string
): Promise<SubmissionView | null> => {
  return prisma.submission.findUnique({
    where: { submission_id: id },
    include: {
      contractor: true,
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
      reviews: true,
    },
  });
};

export const deleteSubmission = async (id: string): Promise<Submission> => {
  return prisma.submission.delete({
    where: { submission_id: id },
  });
};

export const updateSubmission = async (
  id: string,
  data: Partial<Submission>
): Promise<Submission> => {
  return prisma.submission.update({
    where: { submission_id: id },
    data,
  });
};

export const createSubmission = async (
  data: APISubmissionData | APISubmissionData[]
): Promise<Submission[]> => {
  const receivedData: APISubmissionData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((submission) => {
      if (submission.submission_id === "") submission.submission_id = undefined;

      return prisma.submission.create({
        data: submission,
      });
    })
  );
};
