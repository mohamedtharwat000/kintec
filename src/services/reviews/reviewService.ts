import { prisma } from "@/lib/prisma";
import { ReviewStatus, OverallValidationStatus } from "@/types/Review";

export const createReview = async (data: {
  submission_id: string;
  special_review_required: boolean;
  reviewer_name: string;
  review_status: ReviewStatus;
  review_timestamp: string;
  review_rejection_reason?: string;
  overall_validation_status: OverallValidationStatus;
  last_overall_validation_date: string;
  updated_by: string;
  notes?: string;
}) => {
  return prisma.review.create({
    data: {
      submission: { connect: { submission_id: data.submission_id } },
      special_review_required: data.special_review_required,
      reviewer_name: data.reviewer_name,
      review_status: data.review_status,
      review_timestamp: new Date(data.review_timestamp),
      review_rejection_reason: data.review_rejection_reason,
      overall_validation_status: data.overall_validation_status,
      last_overall_validation_date: new Date(data.last_overall_validation_date),
      updated_by: data.updated_by,
      notes: data.notes,
    },
  });
};

export const getReviewById = async (id: string) => {
  return prisma.review.findUnique({
    where: { review_id: id },
    include: { submission: true },
  });
};

export const updateReview = async (
  id: string,
  data: {
    submission_id?: string;
    special_review_required?: boolean;
    reviewer_name?: string;
    review_status?: ReviewStatus;
    review_timestamp?: string;
    review_rejection_reason?: string;
    overall_validation_status?: OverallValidationStatus;
    last_overall_validation_date?: string;
    updated_by?: string;
    notes?: string;
  }
) => {
  return prisma.review.update({
    where: { review_id: id },
    data: {
      ...(data.submission_id && {
        submission: { connect: { submission_id: data.submission_id } },
      }),
      ...(data.special_review_required !== undefined && {
        special_review_required: data.special_review_required,
      }),
      ...(data.reviewer_name && { reviewer_name: data.reviewer_name }),
      ...(data.review_status && { review_status: data.review_status }),
      ...(data.review_timestamp && {
        review_timestamp: new Date(data.review_timestamp),
      }),
      ...(data.review_rejection_reason !== undefined && {
        review_rejection_reason: data.review_rejection_reason,
      }),
      ...(data.overall_validation_status && {
        overall_validation_status: data.overall_validation_status,
      }),
      ...(data.last_overall_validation_date && {
        last_overall_validation_date: new Date(
          data.last_overall_validation_date
        ),
      }),
      ...(data.updated_by && { updated_by: data.updated_by }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
};

export const deleteReview = async (id: string) => {
  return prisma.review.delete({
    where: { review_id: id },
  });
};

export const getAllReviews = async () => {
  return prisma.review.findMany({
    include: { submission: true },
  });
};

export const createReviews = async (
  data: Array<{
    submission_id: string;
    special_review_required: boolean;
    reviewer_name: string;
    review_status: ReviewStatus;
    review_timestamp: string;
    review_rejection_reason?: string;
    overall_validation_status: OverallValidationStatus;
    last_overall_validation_date: string;
    updated_by: string;
    notes?: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const reviews = [];

    for (const reviewData of data) {
      const review = await prisma.review.create({
        data: {
          submission: { connect: { submission_id: reviewData.submission_id } },
          special_review_required: reviewData.special_review_required,
          reviewer_name: reviewData.reviewer_name,
          review_status: reviewData.review_status,
          review_timestamp: new Date(reviewData.review_timestamp),
          review_rejection_reason: reviewData.review_rejection_reason,
          overall_validation_status: reviewData.overall_validation_status,
          last_overall_validation_date: new Date(
            reviewData.last_overall_validation_date
          ),
          updated_by: reviewData.updated_by,
          notes: reviewData.notes,
        },
      });

      reviews.push(review);
    }

    return reviews;
  });
};
