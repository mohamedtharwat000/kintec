import { prisma } from "@/lib/prisma";
import {
  ExpenseValidationRule,
  APIExpenseValidationRuleData,
} from "@/types/ExpenseValidationRule";

export const getAllExpenseValidationRules = async (): Promise<
  ExpenseValidationRule[]
> => {
  return prisma.expense_validation_rule.findMany({
    include: {
      expense: true,
    },
  });
};

export const getExpenseValidationRuleById = async (
  id: string
): Promise<ExpenseValidationRule | null> => {
  return prisma.expense_validation_rule.findUnique({
    where: { exp_val_rule_id: id },
    include: {
      expense: true,
    },
  });
};

export const deleteExpenseValidationRule = async (
  id: string
): Promise<ExpenseValidationRule> => {
  return prisma.expense_validation_rule.delete({
    where: { exp_val_rule_id: id },
  });
};

export const updateExpenseValidationRule = async (
  id: string,
  data: Partial<ExpenseValidationRule>
): Promise<ExpenseValidationRule> => {
  return prisma.expense_validation_rule.update({
    where: { exp_val_rule_id: id },
    data,
  });
};

export const createExpenseValidationRule = async (
  data: APIExpenseValidationRuleData | APIExpenseValidationRuleData[]
): Promise<ExpenseValidationRule[]> => {
  const receivedData: APIExpenseValidationRuleData[] = Array.isArray(data)
    ? data
    : [data];

  return Promise.all(
    receivedData.map((rule) => {
      if (rule.exp_val_rule_id === "") rule.exp_val_rule_id = undefined;

      return prisma.expense_validation_rule.create({
        data: rule,
      });
    })
  );
};
