import { prisma } from "@/lib/prisma";
import { ProjectRule, APIProjectRuleData } from "@/types/ProjectRule";

export const getAllProjectRules = async (): Promise<ProjectRule[]> => {
  return prisma.project_rule.findMany({
    include: {
      project: true,
    },
  });
};

export const getProjectRuleById = async (
  id: string
): Promise<ProjectRule | null> => {
  return prisma.project_rule.findUnique({
    where: { project_rule_id: id },
    include: {
      project: true,
    },
  });
};

export const deleteProjectRule = async (id: string): Promise<ProjectRule> => {
  return prisma.project_rule.delete({
    where: { project_rule_id: id },
  });
};

export const updateProjectRule = async (
  id: string,
  data: Partial<ProjectRule>
): Promise<ProjectRule> => {
  return prisma.project_rule.update({
    where: { project_rule_id: id },
    data,
  });
};

export const createProjectRule = async (
  data: APIProjectRuleData | APIProjectRuleData[]
): Promise<ProjectRule[]> => {
  const receivedData: APIProjectRuleData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((rule) => {
      if (rule.project_rule_id === "") rule.project_rule_id = undefined;

      return prisma.project_rule.create({
        data: rule,
      });
    })
  );
};
