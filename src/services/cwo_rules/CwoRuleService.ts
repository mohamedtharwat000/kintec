import { prisma } from "@/lib/prisma";
import { CWO_Rule as CwoRule, APICWORuleData } from "@/types/CWORule";

export const getAllCwoRules = async (): Promise<CwoRule[]> => {
  return prisma.cWO_rule.findMany({
    include: {
      calloff_work_order: true,
    },
  });
};

export const getCwoRuleById = async (id: string): Promise<CwoRule | null> => {
  return prisma.cWO_rule.findUnique({
    where: { CWO_rule_id: id },
    include: {
      calloff_work_order: true,
    },
  });
};

export const deleteCwoRule = async (id: string): Promise<CwoRule> => {
  return prisma.cWO_rule.delete({
    where: { CWO_rule_id: id },
  });
};

export const updateCwoRule = async (
  id: string,
  data: Partial<CwoRule>
): Promise<CwoRule> => {
  return prisma.cWO_rule.update({
    where: { CWO_rule_id: id },
    data,
  });
};

export const createCwoRule = async (
  data: APICWORuleData | APICWORuleData[]
): Promise<CwoRule[]> => {
  const receivedData: APICWORuleData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((rule) => {
      if (rule.CWO_rule_id === "") rule.CWO_rule_id = undefined;

      return prisma.cWO_rule.create({
        data: rule,
      });
    })
  );
};
