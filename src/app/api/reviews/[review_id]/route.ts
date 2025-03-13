import { NextResponse } from "next/server";
import {
  getReviewById,
  updateReview,
  deleteReview,
} from "@/services/reviews/reviewService";

export async function GET(
  request: Request,
  context: { params: { review_id: string } }
) {
  try {
    const params = await context.params;

    const review = await getReviewById(params.review_id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json(review, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { review_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateReview(params.review_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { review_id: string } }
) {
  try {
    const params = await context.params;
    await deleteReview(params.review_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
