import { NextResponse } from "next/server";
import type { Client, ClientsResponse } from "@/types/clients";

export async function GET() {
  const dummyClients: Client[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "234-567-8901",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "345-678-9012",
    },
  ];

  return NextResponse.json<ClientsResponse>({ clients: dummyClients });
}
