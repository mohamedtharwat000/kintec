import { prisma } from "@/lib/prisma";
import {
  SubmissionValidationRule,
  APISubmissionValidationRuleData,
} from "@/types/SubmissionValidationRule";

export const getAllSubmissionValidationRules = async (): Promise<
  SubmissionValidationRule[]
> => {
  return prisma.submission_validation_rule.findMany({
    include: {
      submission: true,
    },
  });
};

export const getSubmissionValidationRuleById = async (
  id: string
): Promise<SubmissionValidationRule | null> => {
  return prisma.submission_validation_rule.findUnique({
    where: { sub_val_rule_id: id },
    include: {
      submission: true,
    },
  });
};

export const deleteSubmissionValidationRule = async (
  id: string
): Promise<SubmissionValidationRule> => {
  return prisma.submission_validation_rule.delete({
    where: { sub_val_rule_id: id },
  });
};

export const updateSubmissionValidationRule = async (
  id: string,
  data: Partial<SubmissionValidationRule>
): Promise<SubmissionValidationRule> => {
  return prisma.submission_validation_rule.update({
    where: { sub_val_rule_id: id },
    data,
  });
};

export const createSubmissionValidationRule = async (
  data: APISubmissionValidationRuleData | APISubmissionValidationRuleData[]
): Promise<SubmissionValidationRule[]> => {
  const receivedData: APISubmissionValidationRuleData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((rule) => {
      if (rule.sub_val_rule_id === "") rule.sub_val_rule_id = undefined;

      return prisma.submission_validation_rule.create({
        data: rule,
      });
    })
  );
};
