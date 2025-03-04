import { prisma } from "@/lib/prisma";

export const getAllInvoiceFormattingRules = async () => {
  return prisma.invoice_formatting_rule.findMany({
    include: {
      invoice: true,
    },
  });
};

export const getInvoiceFormattingRuleById = async (id: string) => {
  return prisma.invoice_formatting_rule.findUnique({
    where: { inv_formatting_rule_id: id },
    include: {
      invoice: true,
    },
  });
};

export const createInvoiceFormattingRule = async (data: {
  invoice_id: string;
  file_format?: string;
  required_invoice_fields?: string;
  required_fields?: string;
  attachment_requirements?: string;
  workday_definitions?: string;
}) => {
  return prisma.invoice_formatting_rule.create({
    data: {
      invoice: { connect: { invoice_id: data.invoice_id } },
      file_format: data.file_format,
      required_invoice_fields: data.required_invoice_fields,
      attachment_requirements: data.attachment_requirements,
    },
  });
};

export const updateInvoiceFormattingRule = async (id: string, data: any) => {
  const { invoice_id, ...rest } = data;
  return prisma.invoice_formatting_rule.update({
    where: { inv_formatting_rule_id: id },
    data: {
      ...rest,
      ...(invoice_id && { invoice: { connect: { invoice_id } } }),
    },
  });
};

export const deleteInvoiceFormattingRule = async (id: string) => {
  return prisma.invoice_formatting_rule.delete({
    where: { inv_formatting_rule_id: id },
  });
};
