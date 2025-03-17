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
    const requestData: APIClientCompanyData | APIClientCompanyData[] =
      await request.json();
    const client_companies = await createClientCompany(requestData);

    return NextResponse.json(client_companies, { status: 201 });
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
