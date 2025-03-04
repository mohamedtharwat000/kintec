import { overall_validation_status, review_status } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getAllReviews = async () => {
  return prisma.review.findMany({
    include: {
      submission: true,
    },
  });
};

export const getReviewById = async (id: string) => {
  return prisma.review.findUnique({
    where: { review_id: id },
    include: {
      submission: true,
    },
  });
};

export const createReview = async (data: {
  submission_id: string;
  special_review_required: boolean;
  reviewer_name: string;
  review_status: review_status;
  review_timestamp: string;
  review_rejection_reason?: string;
  overall_validation_status: overall_validation_status;
  last_overall_validation_date: string;
  updated_by: string;
  notes?: string;
}) => {
  return prisma.review.create({
    data: {
      submission: { connect: { submission_id: data.submission_id } },
      special_review_required: data.special_review_required,
      reviewer_name: data.reviewer_name,
      review_status: data.review_status as any,
      review_timestamp: new Date(data.review_timestamp),
      review_rejection_reason: data.review_rejection_reason,
      overall_validation_status: data.overall_validation_status as any,
      last_overall_validation_date: new Date(data.last_overall_validation_date),
      updated_by: data.updated_by,
      notes: data.notes,
    },
  });
};

export const updateReview = async (id: string, data: any) => {
  return prisma.review.update({
    where: { review_id: id },
    data: {
      ...data,
      review_timestamp: data.review_timestamp
        ? new Date(data.review_timestamp)
        : undefined,
      last_overall_validation_date: data.last_overall_validation_date
        ? new Date(data.last_overall_validation_date)
        : undefined,
    },
  });
};

export const deleteReview = async (id: string) => {
  return prisma.review.delete({
    where: { review_id: id },
  });
};
