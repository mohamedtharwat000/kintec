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
    const requestData: APIProjectData | APIProjectData[] = await request.json();
    const projects = await createProject(requestData);

    return NextResponse.json(projects, { status: 201 });
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
