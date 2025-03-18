import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllClientCompanies,
  createClientCompany,
} from "@/services/client_companies/clientCompanyService";
import { APIClientCompanyData } from "@/types/ClientCompany";

export async function GET() {
  try {
    const client_companies = await getAllClientCompanies();
    return NextResponse.json(client_companies, { status: 200 });
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
    const requestData: APIClientCompanyData | APIClientCompanyData[] =
      await request.json();
    const client_companies = await createClientCompany(requestData);

    return NextResponse.json(client_companies, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
