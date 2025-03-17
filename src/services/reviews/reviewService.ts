import { prisma } from "@/lib/prisma";
import { Review, APIReviewData } from "@/types/Review";

export const getAllReviews = async (): Promise<Review[]> => {
  return prisma.review.findMany({
    include: {
      submission: true,
    },
  });
};

export const getReviewById = async (id: string): Promise<Review | null> => {
  return prisma.review.findUnique({
    where: { review_id: id },
    include: {
      submission: true,
    },
  });
};

export const deleteReview = async (id: string): Promise<Review> => {
  return prisma.review.delete({
    where: { review_id: id },
  });
};

export const updateReview = async (
  id: string,
  data: Partial<Review>
): Promise<Review> => {
  return prisma.review.update({
    where: { review_id: id },
    data,
  });
};

export const createReview = async (
  data: APIReviewData | APIReviewData[]
): Promise<Review[]> => {
  const receivedData: APIReviewData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((review) => {
      if (review.review_id === "") review.review_id = undefined;

      return prisma.review.create({
        data: review,
      });
    })
  );
};
