import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAllReviews, createReview } from "@/services/reviews/reviewService";
import { APIReviewData } from "@/types/Review";

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIReviewData | APIReviewData[] = await request.json();
    const reviews = await createReview(requestData);

    return NextResponse.json(reviews, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
