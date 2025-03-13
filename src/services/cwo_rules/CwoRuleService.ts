import { prisma } from "@/lib/prisma";

export const createCwoRule = async (data: {
  CWO_id: string;
  CWO_number_format: string;
  final_invoice_label: string;
  CWO_extension_handling: string;
  mob_demob_fee_rules: string;
}) => {
  return prisma.cWO_rule.create({
    data: {
      calloff_work_order: { connect: { CWO_id: data.CWO_id } },
      CWO_number_format: data.CWO_number_format,
      final_invoice_label: data.final_invoice_label,
      CWO_extension_handling: data.CWO_extension_handling,
      mob_demob_fee_rules: data.mob_demob_fee_rules,
    },
  });
};

export const getCwoRuleById = async (id: string) => {
  return prisma.cWO_rule.findUnique({
    where: { CWO_rule_id: id },
    include: {
      calloff_work_order: true,
    },
  });
};

export const updateCwoRule = async (id: string, data: any) => {
  const { CWO_id, ...rest } = data;

  return prisma.cWO_rule.update({
    where: { CWO_rule_id: id },
    data: {
      ...rest,
      ...(CWO_id && { calloff_work_order: { connect: { CWO_id } } }),
    },
  });
};

export const deleteCwoRule = async (id: string) => {
  return prisma.cWO_rule.delete({
    where: { CWO_rule_id: id },
  });
};

export const getAllCwoRules = async () => {
  return prisma.cWO_rule.findMany({
    include: {
      calloff_work_order: true,
    },
  });
};

export const createCwoRules = async (
  data: Array<{
    CWO_id: string;
    CWO_number_format: string;
    final_invoice_label: string;
    CWO_extension_handling: string;
    mob_demob_fee_rules: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const cwoRules = [];
    for (const ruleData of data) {
      const cwoRule = await prisma.cWO_rule.create({
        data: {
          calloff_work_order: { connect: { CWO_id: ruleData.CWO_id } },
          CWO_number_format: ruleData.CWO_number_format,
          final_invoice_label: ruleData.final_invoice_label,
          CWO_extension_handling: ruleData.CWO_extension_handling,
          mob_demob_fee_rules: ruleData.mob_demob_fee_rules,
        },
      });
      cwoRules.push(cwoRule);
    }
    return cwoRules;
  });
};
