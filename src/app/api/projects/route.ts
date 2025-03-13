import { NextResponse } from "next/server";
import {
  getAllProjects,
  createProjects,
} from "@/services/projects/projectService";

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
    const body = await request.json();
    const projectsData = Array.isArray(body) ? body : [body];

    const newProjects = await createProjects(projectsData);

    return NextResponse.json(newProjects, { status: 201 });
  } catch (error: any) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
