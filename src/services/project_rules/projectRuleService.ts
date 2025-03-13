import { prisma } from "@/lib/prisma";
import { additional_review_process } from "@prisma/client";

export const createProjectRule = async (data: {
  project_id: string;
  special_project_rules: string;
  project_rules_reviewer_name: string;
  additional_review_process: additional_review_process;
  major_project_indicator: boolean;
}) => {
  return prisma.project_rule.create({
    data: {
      project: { connect: { project_id: data.project_id } },
      special_project_rules: data.special_project_rules,
      project_rules_reviewer_name: data.project_rules_reviewer_name,
      additional_review_process: data.additional_review_process,
      major_project_indicator: data.major_project_indicator,
    },
  });
};

export const getProjectRuleById = async (id: string) => {
  return prisma.project_rule.findUnique({
    where: { project_rule_id: id },
    include: {
      project: true,
    },
  });
};

export const updateProjectRule = async (id: string, data: any) => {
  const { project_id, ...rest } = data;

  return prisma.project_rule.update({
    where: { project_rule_id: id },
    data: {
      ...rest,
      ...(project_id && { project: { connect: { project_id } } }),
    },
  });
};

export const deleteProjectRule = async (id: string) => {
  return prisma.project_rule.delete({
    where: { project_rule_id: id },
  });
};

export const getAllProjectRules = async () => {
  return prisma.project_rule.findMany({
    include: {
      project: true,
    },
  });
};

export const createProjectRules = async (
  data: Array<{
    project_id: string;
    special_project_rules: string;
    project_rules_reviewer_name: string;
    additional_review_process: additional_review_process;
    major_project_indicator: boolean;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const projectRules = [];

    for (const ruleData of data) {
      const projectRule = await prisma.project_rule.create({
        data: {
          project: { connect: { project_id: ruleData.project_id } },
          special_project_rules: ruleData.special_project_rules,
          project_rules_reviewer_name: ruleData.project_rules_reviewer_name,
          additional_review_process: ruleData.additional_review_process,
          major_project_indicator: ruleData.major_project_indicator,
        },
      });

      projectRules.push(projectRule);
    }

    return projectRules;
  });
};
