import React from "react";
import { getDashboardStats } from "@/services/dashboard/dashboardService";
import {
  Building2,
  Users,
  FileText,
  Briefcase,
  BarChart,
  LayoutDashboard,
  AlertTriangle,
  FileCheck,
  FileClock,
  FileX,
  ClipboardCheck,
  ClipboardX,
  ClipboardList,
} from "lucide-react";
import { SummaryCard, AlertCard } from "@/components/dashboard/DashboardCards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Dashboard() {
  const stats = await getDashboardStats();

  const clientTrend = stats.summary.clientsCount > 10 ? "up" : "neutral";
  const contractorTrend =
    stats.summary.contractorsCount > 15 ? "up" : "neutral";
  const projectTrend = "neutral";
  const contractTrend =
    stats.operations.activeContractsCount >
    stats.operations.expiredContractsCount +
      stats.operations.terminatedContractsCount
      ? "up"
      : "neutral";

  const visaSeverity =
    stats.alerts.expiringVisasCount > 3
      ? "high"
      : stats.alerts.expiringVisasCount > 0
        ? "medium"
        : "low";

  const contractSeverity =
    stats.alerts.expiringContractsCount > 5
      ? "high"
      : stats.alerts.expiringContractsCount > 0
        ? "medium"
        : "low";

  const invoiceSeverity =
    stats.alerts.pendingInvoicesCount > 5
      ? "high"
      : stats.alerts.pendingInvoicesCount > 0
        ? "medium"
        : "low";

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome to your KinTec management dashboard. Here's an overview of
          your current operations.
        </p>
      </div>

      {/* Business Overview */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Business Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-4">
            <SummaryCard
              title="Client Companies"
              count={stats.summary.clientsCount}
              icon={Building2}
              className="from-blue-500/20 to-blue-600/20 border-blue-500/50 hover:shadow-blue-500/10"
              trend={clientTrend}
            />
            <SummaryCard
              title="Contractors"
              count={stats.summary.contractorsCount}
              icon={Users}
              className="from-emerald-500/20 to-emerald-600/20 border-emerald-500/50 hover:shadow-emerald-500/10"
              trend={contractorTrend}
            />
            <SummaryCard
              title="Active Projects"
              count={stats.summary.projectsCount}
              icon={Briefcase}
              className="from-amber-500/20 to-amber-600/20 border-amber-500/50 hover:shadow-amber-500/10"
              trend={projectTrend}
            />
            <SummaryCard
              title="Total Contracts"
              count={stats.summary.contractsCount}
              icon={FileText}
              className="from-purple-500/20 to-purple-600/20 border-purple-500/50 hover:shadow-purple-500/10"
              trend={contractTrend}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Attention Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AlertCard
              title="Expiring Visas"
              count={stats.alerts.expiringVisasCount}
              description={`${stats.alerts.expiringVisasCount} visas expiring in the next 30 days`}
              severity={visaSeverity}
            />
            <AlertCard
              title="Contracts Ending Soon"
              count={stats.alerts.expiringContractsCount}
              description={`${stats.alerts.expiringContractsCount} contracts expiring soon`}
              severity={contractSeverity}
            />
            <AlertCard
              title="Pending Invoices"
              count={stats.alerts.pendingInvoicesCount}
              description="Invoices awaiting payment"
              severity={invoiceSeverity}
            />
          </div>
        </CardContent>
      </Card>

      {/* Operations Status */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
            <BarChart className="mr-2 h-5 w-5" />
            Operations Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-md font-medium flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Contracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Active"
                      count={stats.operations.activeContractsCount}
                      icon={FileCheck}
                      className="from-green-500/20 to-green-600/20 border-green-500/50 h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Expired"
                      count={stats.operations.expiredContractsCount}
                      icon={FileClock}
                      className="from-gray-300/20 to-gray-400/20 border-gray-400/50 h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Terminated"
                      count={stats.operations.terminatedContractsCount}
                      icon={FileX}
                      className="from-red-500/20 to-red-600/20 border-red-500/50 h-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-md font-medium flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Purchase Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Active"
                      count={stats.operations.activePOsCount}
                      icon={ClipboardCheck}
                      className="from-blue-500/20 to-blue-600/20 border-blue-500/50 h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Expired"
                      count={stats.operations.expiredPOsCount}
                      icon={ClipboardList}
                      className="from-gray-300/20 to-gray-400/20 border-gray-400/50 h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Cancelled"
                      count={stats.operations.cancelledPOsCount}
                      icon={ClipboardX}
                      className="from-red-500/20 to-red-600/20 border-red-500/50 h-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-md font-medium flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Work Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Active"
                      count={stats.operations.activeCWOsCount}
                      icon={ClipboardCheck}
                      className="from-purple-500/20 to-purple-600/20 border-purple-500/50 h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Expired"
                      count={stats.operations.expiredCWOsCount}
                      icon={ClipboardList}
                      className="from-gray-300/20 to-gray-400/20 border-gray-400/50 h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <SummaryCard
                      title="Cancelled"
                      count={stats.operations.cancelledCWOsCount}
                      icon={ClipboardX}
                      className="from-red-500/20 to-red-600/20 border-red-500/50 h-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
