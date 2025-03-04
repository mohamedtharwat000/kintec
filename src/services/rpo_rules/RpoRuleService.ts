import { prisma } from "@/lib/prisma";

export const getAllRpoRules = async () => {
  return prisma.rPO_rule.findMany({
    include: {
      purchase_order: true,
    },
  });
};

export const getRpoRuleById = async (id: string) => {
  return prisma.rPO_rule.findUnique({
    where: { RPO_rule_id: id },
    include: {
      purchase_order: true,
    },
  });
};

export const createRpoRule = async (data: {
  PO_id: string;
  RPO_number_format: string;
  final_invoice_label: string;
  RPO_extension_handling: string;
  mob_demob_fee_rules: string;
}) => {
  return prisma.rPO_rule.create({
    data: {
      purchase_order: { connect: { PO_id: data.PO_id } },
      RPO_number_format: data.RPO_number_format,
      final_invoice_label: data.final_invoice_label,
      RPO_extension_handling: data.RPO_extension_handling,
      mob_demob_fee_rules: data.mob_demob_fee_rules,
    },
  });
};

export const updateRpoRule = async (id: string, data: any) => {
  const { PO_id, ...rest } = data;

  return prisma.rPO_rule.update({
    where: { RPO_rule_id: id },
    data: {
      ...rest,
      ...(PO_id && { purchase_order: { connect: { PO_id } } }),
    },
  });
};

export const deleteRpoRule = async (id: string) => {
  return prisma.rPO_rule.delete({
    where: { RPO_rule_id: id },
  });
};
