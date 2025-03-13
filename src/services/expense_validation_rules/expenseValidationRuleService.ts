import { prisma } from "@/lib/prisma";

export const createExpenseValidationRule = async (data: {
  expense_id: string;
  allowable_expense_types?: string;
  expense_documentation?: string;
  supporting_documentation_type?: string;
  expense_limit?: string;
  reimbursement_rule?: string;
}) => {
  return prisma.expense_validation_rule.create({
    data: {
      expense: { connect: { expense_id: data.expense_id } },
      allowable_expense_types: data.allowable_expense_types,
      expense_documentation: data.expense_documentation,
      supporting_documentation_type: data.supporting_documentation_type,
      expense_limit: data.expense_limit,
      reimbursement_rule: data.reimbursement_rule,
    },
  });
};

export const getExpenseValidationRuleById = async (id: string) => {
  return prisma.expense_validation_rule.findUnique({
    where: { exp_val_rule_id: id },
    include: {
      expense: true,
    },
  });
};

export const updateExpenseValidationRule = async (id: string, data: any) => {
  const { expense_id, ...rest } = data;

  return prisma.expense_validation_rule.update({
    where: { exp_val_rule_id: id },
    data: {
      ...rest,
      ...(expense_id && { expense: { connect: { expense_id } } }),
    },
  });
};

export const deleteExpenseValidationRule = async (id: string) => {
  return prisma.expense_validation_rule.delete({
    where: { exp_val_rule_id: id },
  });
};

export const getAllExpenseValidationRules = async () => {
  return prisma.expense_validation_rule.findMany({
    include: {
      expense: true,
    },
  });
};

export const createExpenseValidationRules = async (
  data: Array<{
    expense_id: string;
    allowable_expense_types?: string;
    expense_documentation?: string;
    supporting_documentation_type?: string;
    expense_limit?: string;
    reimbursement_rule?: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const expenseValidationRules = [];

    for (const ruleData of data) {
      const expenseValidationRule = await prisma.expense_validation_rule.create(
        {
          data: {
            expense: { connect: { expense_id: ruleData.expense_id } },
            allowable_expense_types: ruleData.allowable_expense_types,
            expense_documentation: ruleData.expense_documentation,
            supporting_documentation_type:
              ruleData.supporting_documentation_type,
            expense_limit: ruleData.expense_limit,
            reimbursement_rule: ruleData.reimbursement_rule,
          },
        }
      );

      expenseValidationRules.push(expenseValidationRule);
    }

    return expenseValidationRules;
  });
};
