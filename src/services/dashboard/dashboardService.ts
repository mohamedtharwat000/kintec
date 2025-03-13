import { prisma } from "@/lib/prisma";
import {
  contract_status,
  invoice_status,
  PO_status,
  visa_status,
} from "@prisma/client";

export async function getDashboardStats() {
  const clientsCount = await prisma.client_company.count();
  const contractorsCount = await prisma.contractor.count();
  const projectsCount = await prisma.project.count();
  const contractsCount = await prisma.contract.count();

  const invoicesCount = await prisma.invoice.count();
  const pendingInvoicesCount = await prisma.invoice.count({
    where: { invoice_status: invoice_status.pending },
  });
  const paidInvoicesCount = await prisma.invoice.count({
    where: { invoice_status: invoice_status.paid },
  });
  const totalInvoiceValue = await prisma.invoice.aggregate({
    _sum: { invoice_total_value: true },
  });

  const activeContractsCount = await prisma.contract.count({
    where: { contract_status: contract_status.active },
  });
  const expiredContractsCount = await prisma.contract.count({
    where: { contract_status: contract_status.expired },
  });
  const terminatedContractsCount = await prisma.contract.count({
    where: { contract_status: contract_status.terminated },
  });

  const activePOsCount = await prisma.purchase_order.count({
    where: { PO_status: PO_status.active },
  });
  const expiredPOsCount = await prisma.purchase_order.count({
    where: { PO_status: PO_status.expired },
  });

  const submissionsCount = await prisma.submission.count();
  const reviewsCount = await prisma.review.count();

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

  return {
    summary: {
      clientsCount,
      contractorsCount,
      projectsCount,
      contractsCount,
    },
    financial: {
      invoicesCount,
      pendingInvoicesCount,
      paidInvoicesCount,
      totalInvoiceValue: totalInvoiceValue._sum.invoice_total_value || 0,
    },
    operations: {
      activeContractsCount,
      expiredContractsCount,
      terminatedContractsCount,
      activePOsCount,
      expiredPOsCount,
      submissionsCount,
      reviewsCount,
    },
    alerts: {
      expiringVisasCount,
      expiringContractsCount,
    },
  };
}
