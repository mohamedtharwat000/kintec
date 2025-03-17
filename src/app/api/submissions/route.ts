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
    const requestData: APISubmissionData | APISubmissionData[] =
      await request.json();
    const submissions = await createSubmission(requestData);

    return NextResponse.json(submissions, { status: 201 });
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
