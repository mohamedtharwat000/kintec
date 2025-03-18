import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAllReviews, createReview } from "@/services/reviews/reviewService";
import { APIReviewData } from "@/types/Review";

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json(reviews, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIReviewData | APIReviewData[] = await request.json();
    const reviews = await createReview(requestData);

    return NextResponse.json(reviews, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
