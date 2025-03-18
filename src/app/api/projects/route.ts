import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllProjects,
  createProject,
} from "@/services/projects/projectService";
import { APIProjectData } from "@/types/Project";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects, { status: 200 });
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
    const requestData: APIProjectData | APIProjectData[] = await request.json();
    const projects = await createProject(requestData);

    return NextResponse.json(projects, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
