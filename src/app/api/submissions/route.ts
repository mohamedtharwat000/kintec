import { NextResponse } from "next/server";
import {
  getAllSubmissions,
  createSubmission,
} from "@/services/submissions/submissionService";

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
    const body = await request.json();
    const newSubmission = await createSubmission(body);
    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error: any) {
    console.error(error.code);
    //Contract does not point at a contractor, client_company or a project
    //   if (error instanceof Error && "code" in error && error.code === "P2025") {
    //       return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    //     }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
