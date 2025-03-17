import { prisma } from "@/lib/prisma";
import { RPO_Rule as RpoRule, APIRPORuleData } from "@/types/PORule";

export const getAllRpoRules = async (): Promise<RpoRule[]> => {
  return prisma.rPO_rule.findMany({
    include: {
      purchase_order: true,
    },
  });
};

export const getRpoRuleById = async (id: string): Promise<RpoRule | null> => {
  return prisma.rPO_rule.findUnique({
    where: { RPO_rule_id: id },
    include: {
      purchase_order: true,
    },
  });
};

export const deleteRpoRule = async (id: string): Promise<RpoRule> => {
  return prisma.rPO_rule.delete({
    where: { RPO_rule_id: id },
  });
};

export const updateRpoRule = async (
  id: string,
  data: Partial<RpoRule>
): Promise<RpoRule> => {
  return prisma.rPO_rule.update({
    where: { RPO_rule_id: id },
    data,
  });
};

export const createRpoRule = async (
  data: APIRPORuleData | APIRPORuleData[]
): Promise<RpoRule[]> => {
  const receivedData: APIRPORuleData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((rule) => {
      if (rule.RPO_rule_id === "") rule.RPO_rule_id = undefined;

      return prisma.rPO_rule.create({
        data: rule,
      });
    })
  );
};
