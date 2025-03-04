import { prisma } from "@/lib/prisma";

export const getAllSubmissions = async () => {
  const submissions = await prisma.submission.findMany({
    include: {
      contractor: true,
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
      reviews: true,
    },
  });

  return submissions.map((submission) => {
    if (submission.purchase_order) {
      const { calloff_work_order, ...rest } = submission;
      return rest;
    } else if (submission.calloff_work_order) {
      const { purchase_order, ...rest } = submission;
      return rest;
    }
    return submission;
  });
};

export const getSubmissionById = async (id: string) => {
  const submission = await prisma.submission.findUnique({
    where: { submission_id: id },
    include: {
      contractor: true,
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
      reviews: true,
    },
  });

  if (!submission) return null;

  if (submission.purchase_order) {
    const { calloff_work_order, ...rest } = submission;
    return rest;
  } else if (submission.calloff_work_order) {
    const { purchase_order, ...rest } = submission;
    return rest;
  }
  return submission;
};

export const createSubmission = async (data: {
  contractor_id: string;
  PO_id?: string;
  CWO_id?: string;
  billing_period: string;
  payment_currency: string;
  invoice_currency: string;
  invoice_due_date: string;
  wht_rate?: number;
  wht_applicable?: boolean;
  external_assignment?: boolean;
}) => {
  // Ensure that exactly one of PO_id or CWO_id is provided.
  if ((!data.PO_id && !data.CWO_id) || (data.PO_id && data.CWO_id)) {
    throw new Error("Exactly one of PO_id or CWO_id must be provided.");
  }

  return prisma.submission.create({
    data: {
      contractor: { connect: { contractor_id: data.contractor_id } },
      billing_period: new Date(data.billing_period),
      payment_currency: data.payment_currency,
      invoice_currency: data.invoice_currency,
      invoice_due_date: new Date(data.invoice_due_date),
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

export const updateSubmission = async (
  id: string,
  data: {
    contractor_id?: string;
    PO_id?: string;
    CWO_id?: string;
    billing_period?: string;
    payment_currency?: string;
    invoice_currency?: string;
    invoice_due_date?: string;
    wht_rate?: number;
    wht_applicable?: boolean;
    external_assignment?: boolean;
  }
) => {
  if (data.PO_id !== undefined && data.CWO_id !== undefined) {
    throw new Error("Provide only one of PO_id or CWO_id.");
  }

  return prisma.submission.update({
    where: { submission_id: id },
    data: {
      ...(data.contractor_id && {
        contractor: { connect: { contractor_id: data.contractor_id } },
      }),
      ...(data.billing_period && {
        billing_period: new Date(data.billing_period),
      }),
      ...(data.payment_currency && { payment_currency: data.payment_currency }),
      ...(data.invoice_currency && { invoice_currency: data.invoice_currency }),
      ...(data.invoice_due_date && {
        invoice_due_date: new Date(data.invoice_due_date),
      }),
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

export const deleteSubmission = async (id: string) => {
  return prisma.submission.delete({
    where: { submission_id: id },
  });
};
