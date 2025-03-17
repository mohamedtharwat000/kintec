import { review } from "@prisma/client";

export type Review = review;

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIReviewData = MakePropertyOptional<Review, "review_id">;

export enum ReviewStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum OverallValidationStatus {
  approved = "approved",
  rejected = "rejected",
}
