import { invoice_status, invoice_type } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const getAllInvoices = async () => {
  const invoices = await prisma.invoice.findMany({
    include: {
      purchase_order: true,
      calloff_work_order: true,
      formatting_rules: true,
    },
  });

  return invoices.map((invoice) => {
    if (invoice.purchase_order) {
      const { calloff_work_order, ...rest } = invoice;
      return rest;
    } else if (invoice.calloff_work_order) {
      const { purchase_order, ...rest } = invoice;
      return rest;
    }
    return invoice;
  });
};

export const getInvoiceById = async (id: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
      formatting_rules: true,
    },
  });

  if (!invoice) return null;

  if (invoice.purchase_order) {
    const { calloff_work_order, ...rest } = invoice;
    return rest;
  } else if (invoice.calloff_work_order) {
    const { purchase_order, ...rest } = invoice;
    return rest;
  }
  return invoice;
};

export const createInvoice = async (data: {
  PO_id?: string;
  CWO_id?: string;
  billing_period: string;
  invoice_status: invoice_status;
  invoice_type: invoice_type;
  invoice_currency: string;
  invoice_total_value: Decimal;
  wht_rate?: number;
  wht_applicable?: boolean;
  external_assignment?: boolean;
}) => {
  // Ensure that exactly one of PO_id or CWO_id is provided.
  if ((!data.PO_id && !data.CWO_id) || (data.PO_id && data.CWO_id)) {
    throw new Error("Exactly one of PO_id or CWO_id must be provided.");
  }

  return prisma.invoice.create({
    data: {
      billing_period: new Date(data.billing_period),
      invoice_status: data.invoice_status,
      invoice_type: data.invoice_type,
      invoice_currency: data.invoice_currency,
      invoice_total_value: data.invoice_total_value,
      wht_rate: data.wht_rate,
      wht_applicable: data.wht_applicable,
      external_assignment: data.external_assignment,
      ...(data.PO_id
        ? { purchase_order: { connect: { PO_id: data.PO_id } } }
        : {}),
      ...(data.CWO_id
        ? { calloff_work_order: { connect: { CWO_id: data.CWO_id } } }
        : {}),
    },
  });
};

export const createInvoices = async (
  data: Array<{
    PO_id?: string;
    CWO_id?: string;
    billing_period: string;
    invoice_status: invoice_status;
    invoice_type: invoice_type;
    invoice_currency: string;
    invoice_total_value: Decimal;
    wht_rate?: number;
    wht_applicable?: boolean;
    external_assignment?: boolean;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const invoices = [];

    for (const invoiceData of data) {
      // Ensure that exactly one of PO_id or CWO_id is provided.
      if (
        (!invoiceData.PO_id && !invoiceData.CWO_id) ||
        (invoiceData.PO_id && invoiceData.CWO_id)
      ) {
        throw new Error("Exactly one of PO_id or CWO_id must be provided.");
      }

      const invoice = await prisma.invoice.create({
        data: {
          billing_period: new Date(invoiceData.billing_period),
          invoice_status: invoiceData.invoice_status,
          invoice_type: invoiceData.invoice_type,
          invoice_currency: invoiceData.invoice_currency,
          invoice_total_value: invoiceData.invoice_total_value,
          wht_rate: invoiceData.wht_rate,
          wht_applicable: invoiceData.wht_applicable,
          external_assignment: invoiceData.external_assignment,
          ...(invoiceData.PO_id
            ? { purchase_order: { connect: { PO_id: invoiceData.PO_id } } }
            : {}),
          ...(invoiceData.CWO_id
            ? { calloff_work_order: { connect: { CWO_id: invoiceData.CWO_id } } }
            : {}),
        },
      });

      invoices.push(invoice);
    }

    return invoices;
  });
};


export const updateInvoice = async (
  id: string,
  data: {
    PO_id?: string;
    CWO_id?: string;
    billing_period?: string;
    invoice_status?: invoice_status;
    invoice_type?: invoice_type;
    invoice_currency?: string;
    invoice_total_value?: Decimal;
    wht_rate?: number;
    wht_applicable?: boolean;
    external_assignment?: boolean;
  }
) => {
  if (data.PO_id !== undefined && data.CWO_id !== undefined) {
    throw new Error("Provide only one of PO_id or CWO_id.");
  }

  return prisma.invoice.update({
    where: { invoice_id: id },
    data: {
      ...(data.billing_period && {
        billing_period: new Date(data.billing_period),
      }),
      ...(data.invoice_type && { invoice_type: data.invoice_type }),
      ...(data.invoice_status && { invoice_status: data.invoice_status }),
      ...(data.invoice_currency && { invoice_currency: data.invoice_currency }),
      ...(data.wht_rate !== undefined && { wht_rate: data.wht_rate }),
      ...(data.wht_applicable !== undefined && {
        wht_applicable: data.wht_applicable,
      }),
      ...(data.external_assignment !== undefined && {
        external_assignment: data.external_assignment,
      }),
      ...(data.PO_id !== undefined
        ? { purchase_order: { connect: { PO_id: data.PO_id } } }
        : {}),
      ...(data.CWO_id !== undefined
        ? { calloff_work_order: { connect: { CWO_id: data.CWO_id } } }
        : {}),
    },
  });
};

export const deleteInvoice = async (id: string) => {
  return prisma.invoice.delete({
    where: { invoice_id: id },
  });
};
