import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllSubmissions,
  createSubmission,
} from "@/services/submissions/submissionService";
import { APISubmissionData } from "@/types/Submission";

export async function GET() {
  try {
    const submissions = await getAllSubmissions();
    return NextResponse.json(submissions, { status: 200 });
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
    const requestData: APISubmissionData | APISubmissionData[] =
      await request.json();
    const submissions = await createSubmission(requestData);

    return NextResponse.json(submissions, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
