import { prisma } from "@/lib/prisma";
import {
  contract_status,
  invoice_status,
  PO_status,
  visa_status,
} from "@prisma/client";

export async function getDashboardStats() {
  // Summary statistics
  const clientsCount = await prisma.client_company.count();
  const contractorsCount = await prisma.contractor.count();
  const projectsCount = await prisma.project.count();
  const contractsCount = await prisma.contract.count();

  // Contract statistics
  const activeContractsCount = await prisma.contract.count({
    where: { contract_status: contract_status.active },
  });
  const expiredContractsCount = await prisma.contract.count({
    where: { contract_status: contract_status.expired },
  });
  const terminatedContractsCount = await prisma.contract.count({
    where: { contract_status: contract_status.terminated },
  });

  // Purchase order statistics
  const activePOsCount = await prisma.purchase_order.count({
    where: { PO_status: PO_status.active },
  });
  const expiredPOsCount = await prisma.purchase_order.count({
    where: { PO_status: PO_status.expired },
  });
  const cancelledPOsCount = await prisma.purchase_order.count({
    where: { PO_status: PO_status.cancelled },
  });

  // Call-off work order statistics
  const activeCWOsCount = await prisma.calloff_work_order.count({
    where: { CWO_status: PO_status.active },
  });
  const expiredCWOsCount = await prisma.calloff_work_order.count({
    where: { CWO_status: PO_status.expired },
  });
  const cancelledCWOsCount = await prisma.calloff_work_order.count({
    where: { CWO_status: PO_status.cancelled },
  });

  // Alerts for expiring items and pending invoices
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringVisasCount = await prisma.visa_detail.count({
    where: {
      visa_expiry_date: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
      visa_status: visa_status.active,
    },
  });

  const expiringContractsCount = await prisma.contract.count({
    where: {
      contract_end_date: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
      contract_status: contract_status.active,
    },
  });

  const pendingInvoicesCount = await prisma.invoice.count({
    where: { invoice_status: invoice_status.pending },
  });

  return {
    summary: {
      clientsCount,
      contractorsCount,
      projectsCount,
      contractsCount,
    },
    operations: {
      activeContractsCount,
      expiredContractsCount,
      terminatedContractsCount,
      activePOsCount,
      expiredPOsCount,
      cancelledPOsCount,
      activeCWOsCount,
      expiredCWOsCount,
      cancelledCWOsCount,
    },
    alerts: {
      expiringVisasCount,
      expiringContractsCount,
      pendingInvoicesCount,
    },
  };
}
