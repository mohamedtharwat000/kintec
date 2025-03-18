import { prisma } from "@/lib/prisma";
import { Invoice, InvoiceView, APIInvoiceData } from "@/types/Invoice";

type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export const getAllInvoices = async (): Promise<Invoice[]> => {
  return prisma.invoice.findMany({
    include: {
      purchase_order: true,
      calloff_work_order: true,
      formatting_rules: true,
    },
  });
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  return prisma.invoice.findUnique({
    where: { invoice_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
      formatting_rules: true,
    },
  });
};

export const deleteInvoice = async (id: string): Promise<Invoice> => {
  return prisma.invoice.delete({
    where: { invoice_id: id },
  });
};

export const updateInvoice = async (
  id: string,
  data: Partial<Invoice>
): Promise<Invoice> => {
  return prisma.invoice.update({
    where: { invoice_id: id },
    data,
  });
};

export const createInvoice = async (
  data: APIInvoiceData | APIInvoiceData[]
): Promise<Invoice[]> => {
  const receivedData: APIInvoiceData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((invoice) => {
      if (invoice.invoice_id === "") invoice.invoice_id = undefined;
      if (invoice.PO_id === "") invoice.PO_id = null;
      if (invoice.CWO_id === "") invoice.CWO_id = null;
      if (!invoice.wht_rate) invoice.wht_rate = null;

      return prisma.invoice.create({
        data: invoice,
      });
    })
  );
};
