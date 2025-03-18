import { NextResponse } from "next/server";
import {
  getClientCompanyById,
  updateClientCompany,
  deleteClientCompany,
} from "@/services/client_companies/clientCompanyService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ client_company_id: string }> }
) {
  try {
    const { client_company_id } = await context.params;

    const client_company = await getClientCompanyById(client_company_id);
    if (!client_company) {
      return NextResponse.json(
        { error: "Client Company not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(client_company, { status: 200 });
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
  context: { params: Promise<{ client_company_id: string }> }
) {
  try {
    const { client_company_id } = await context.params;
    const body = await request.json();
    const updated = await updateClientCompany(client_company_id, body);
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
  context: { params: Promise<{ client_company_id: string }> }
) {
  try {
    const { client_company_id } = await context.params;
    await deleteClientCompany(client_company_id);
    return NextResponse.json(
      { message: "Client Company deleted successfully" },
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
