import { NextResponse } from "next/server";
import {
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "@/services/submissions/submissionService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ submission_id: string }> }
) {
  try {
    const { submission_id } = await context.params;

    const submission = await getSubmissionById(submission_id);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(submission, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ submission_id: string }> }
) {
  try {
    const { submission_id } = await context.params;
    const body = await request.json();
    const updated = await updateSubmission(submission_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ submission_id: string }> }
) {
  try {
    const { submission_id } = await context.params;
    await deleteSubmission(submission_id);
    return NextResponse.json(
      { message: "Submission deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
