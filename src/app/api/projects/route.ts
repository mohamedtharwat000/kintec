import { NextResponse } from "next/server";
import {
  getAllProjects,
  createProject,
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
    const newProject = await createProject(body);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
