import { NextResponse } from "next/server";
import {
  getAllClientCompanies,
  createClientCompany,
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
    const newClientCompany = await createClientCompany(body);
    return NextResponse.json(newClientCompany, { status: 201 });
  } catch (error: any) {
    // Unique contact email per company
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
