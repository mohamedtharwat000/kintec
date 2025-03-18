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

  receivedData.forEach((submission) => {
    if (
      (!submission.PO_id && !submission.CWO_id) ||
      (submission.PO_id && submission.CWO_id)
    ) {
      throw new Error("Exactly one of PO_id or CWO_id must be provided.");
    }
  });

  return Promise.all(
    receivedData.map((submission) => {
      if (submission.submission_id === "") submission.submission_id = undefined;
      if (submission.CWO_id === "") submission.CWO_id = null;
      if (submission.PO_id === "") submission.PO_id = null;
      if (!submission.wht_applicable) submission.wht_applicable = null;
      if (!submission.external_assignment)
        submission.external_assignment = null;

      return prisma.submission.create({
        data: submission,
      });
    })
  );
};
