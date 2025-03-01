import { NextResponse } from "next/server";
import {
  getClientCompanyById,
  updateClientCompany,
  deleteClientCompany,
} from "@/services/client_companies/clientCompanyService";

export async function GET(
  request: Request,
  context: { params: { client_company_id: string } }
) {
  try {
    const params = await context.params;

    const client_company = await getClientCompanyById(params.client_company_id);
    if (!client_company) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(client_company, { status: 200 });
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
  context: { params: { client_company_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateClientCompany(params.client_company_id, body);
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
  context: { params: { client_company_id: string } }
) {
  try {
    const params = await context.params;
    await deleteClientCompany(params.client_company_id);
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
