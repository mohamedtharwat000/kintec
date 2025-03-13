import React from "react";
import { getDashboardStats } from "@/services/dashboard/dashboardService";
import {
  Building2,
  Users,
  FileText,
  Briefcase,
  DollarSign,
  FileSearch,
  BarChart,
  LayoutDashboard,
  PiggyBank,
  Receipt,
} from "lucide-react";
import {
  SummaryCard,
  MetricCard,
  StatusCard,
} from "@/components/dashboard/DashboardCards";

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your KinTec dashboard.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5" />
          Summary
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Client Companies"
            count={stats.summary.clientsCount}
            icon={Building2}
            className="border-b-4 border-blue-500"
          />
          <SummaryCard
            title="Contractors"
            count={stats.summary.contractorsCount}
            icon={Users}
            className="border-b-4 border-emerald-500"
          />
          <SummaryCard
            title="Projects"
            count={stats.summary.projectsCount}
            icon={Briefcase}
            className="border-b-4 border-amber-500"
          />
          <SummaryCard
            title="Contracts"
            count={stats.summary.contractsCount}
            icon={FileText}
            className="border-b-4 border-purple-500"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Financial
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <StatusCard
            title="Invoices Status"
            items={[
              {
                label: "Paid",
                value: stats.financial.paidInvoicesCount,
                color: "bg-green-500",
              },
              {
                label: "Pending",
                value: stats.financial.pendingInvoicesCount,
                color: "bg-yellow-500",
              },
            ]}
          />
          <MetricCard
            title="Total Invoice Value"
            value={`$${Number(
              stats.financial.totalInvoiceValue
            ).toLocaleString()}`}
            icon={PiggyBank}
            description="Across all invoices"
          />
          <MetricCard
            title="Total Invoices"
            value={stats.financial.invoicesCount}
            icon={Receipt}
            description={`${stats.financial.pendingInvoicesCount} pending payment`}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Operations
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <StatusCard
            title="Contract Status"
            items={[
              {
                label: "Active",
                value: stats.operations.activeContractsCount,
                color: "bg-green-500",
              },
              {
                label: "Expired",
                value: stats.operations.expiredContractsCount,
                color: "bg-gray-500",
              },
              {
                label: "Terminated",
                value: stats.operations.terminatedContractsCount,
                color: "bg-red-500",
              },
            ]}
          />
          <StatusCard
            title="Purchase Orders"
            items={[
              {
                label: "Active",
                value: stats.operations.activePOsCount,
                color: "bg-blue-500",
              },
              {
                label: "Expired",
                value: stats.operations.expiredPOsCount,
                color: "bg-gray-500",
              },
            ]}
          />
          <MetricCard
            title="Submissions"
            value={stats.operations.submissionsCount}
            icon={FileSearch}
            description={`${stats.operations.reviewsCount} reviews conducted`}
          />
        </div>
      </div>
    </div>
  );
}
