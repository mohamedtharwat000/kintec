import { prisma } from "@/lib/prisma";
import {
  InvoiceFormattingRule,
  APIInvoiceFormattingRuleData,
} from "@/types/InvoiceFormattingRule";

export const getAllInvoiceFormattingRules = async (): Promise<
  InvoiceFormattingRule[]
> => {
  return prisma.invoice_formatting_rule.findMany({
    include: {
      invoice: true,
    },
  });
};

export const getInvoiceFormattingRuleById = async (
  id: string
): Promise<InvoiceFormattingRule | null> => {
  return prisma.invoice_formatting_rule.findUnique({
    where: { inv_formatting_rule_id: id },
    include: {
      invoice: true,
    },
  });
};

export const deleteInvoiceFormattingRule = async (
  id: string
): Promise<InvoiceFormattingRule> => {
  return prisma.invoice_formatting_rule.delete({
    where: { inv_formatting_rule_id: id },
  });
};

export const updateInvoiceFormattingRule = async (
  id: string,
  data: Partial<InvoiceFormattingRule>
): Promise<InvoiceFormattingRule> => {
  return prisma.invoice_formatting_rule.update({
    where: { inv_formatting_rule_id: id },
    data,
  });
};

export const createInvoiceFormattingRule = async (
  data: APIInvoiceFormattingRuleData | APIInvoiceFormattingRuleData[]
): Promise<InvoiceFormattingRule[]> => {
  const receivedData: APIInvoiceFormattingRuleData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((rule) => {
      if (rule.inv_formatting_rule_id === "")
        rule.inv_formatting_rule_id = undefined;

      return prisma.invoice_formatting_rule.create({
        data: rule,
      });
    })
  );
};
