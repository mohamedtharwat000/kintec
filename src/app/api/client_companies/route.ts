import { NextResponse } from "next/server";
import {
  getAllClientCompanies,
  createClientCompanies,
} from "@/services/client_companies/clientCompanyService";

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
    const body = await request.json();
    const companiesData = Array.isArray(body) ? body : [body];

    const newClientCompanies = await createClientCompanies(companiesData);

    return NextResponse.json(newClientCompanies, { status: 201 });
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
