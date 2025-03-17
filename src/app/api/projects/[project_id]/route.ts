import { NextResponse } from "next/server";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "@/services/projects/projectService";

export async function GET(
  request: Request,
  context: { params: { project_id: string } }
) {
  try {
    const params = await context.params;

    const project = await getProjectById(params.project_id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project, { status: 200 });
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
  context: { params: { project_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateProject(params.project_id, body);
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
  context: { params: { project_id: string } }
) {
  try {
    const params = await context.params;
    await deleteProject(params.project_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
