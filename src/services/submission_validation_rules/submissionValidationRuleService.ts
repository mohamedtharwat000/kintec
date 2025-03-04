import { prisma } from "@/lib/prisma";
import { required_fields } from "@prisma/client";

export const getAllSubmissionValidationRules = async () => {
  return prisma.submission_validation_rule.findMany({
    include: {
      submission: true,
    },
  });
};

export const getSubmissionValidationRuleById = async (id: string) => {
  return prisma.submission_validation_rule.findUnique({
    where: { sub_val_rule_id: id },
    include: {
      submission: true,
    },
  });
};

export const createSubmissionValidationRule = async (data: {
  submission_id: string;
  approval_signature_rules?: string;
  approval_date_rules?: string;
  required_fields?: required_fields;
  template_requirements?: string;
  workday_definitions?: string;
}) => {
  return prisma.submission_validation_rule.create({
    data: {
      submission: { connect: { submission_id: data.submission_id } },
      approval_signature_rules: data.approval_signature_rules,
      approval_date_rules: data.approval_date_rules,
      required_fields: data.required_fields,
      template_requirements: data.template_requirements,
      workday_definitions: data.workday_definitions,
    },
  });
};

export const updateSubmissionValidationRule = async (id: string, data: any) => {
  const { submission_id, ...rest } = data;
  return prisma.submission_validation_rule.update({
    where: { sub_val_rule_id: id },
    data: {
      ...rest,
      ...(submission_id && { submission: { connect: { submission_id } } }),
    },
  });
};

export const deleteSubmissionValidationRule = async (id: string) => {
  return prisma.submission_validation_rule.delete({
    where: { sub_val_rule_id: id },
  });
};
