import { expense_type, expense_frequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const createExpense = async (data: {
  PO_id?: string;
  CWO_id?: string;
  expense_type: expense_type;
  expense_frequency: expense_frequency;
  expense_value: number;
  expsense_currency: string;
  pro_rata_percentage: number;
}) => {
  if ((!data.PO_id && !data.CWO_id) || (data.PO_id && data.CWO_id)) {
    throw new Error("Exactly one of PO_id or CWO_id must be provided.");
  }

  return prisma.expense.create({
    data: {
      expense_type: data.expense_type,
      expense_frequency: data.expense_frequency,
      expense_value: data.expense_value,
      expsense_currency: data.expsense_currency,
      pro_rata_percentage: data.pro_rata_percentage,
      ...(data.PO_id
        ? { purchase_order: { connect: { PO_id: data.PO_id } } }
        : {}),
      ...(data.CWO_id
        ? { calloff_work_order: { connect: { CWO_id: data.CWO_id } } }
        : {}),
    },
  });
};

export const getExpenseById = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: { expense_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
    },
  });

  if (!expense) return null;

  if (expense.purchase_order) {
    const { calloff_work_order, ...rest } = expense;
    return rest;
  } else if (expense.calloff_work_order) {
    const { purchase_order, ...rest } = expense;
    return rest;
  }
  return expense;
};

export const updateExpense = async (
  id: string,
  data: {
    PO_id?: string;
    CWO_id?: string;
    expense_type?: expense_type;
    expense_frequency?: expense_frequency;
    expense_value?: number;
    expsense_currency?: string;
    pro_rata_percentage?: number;
  }
) => {
  if (data.PO_id !== undefined && data.CWO_id !== undefined) {
    throw new Error("Provide only one of PO_id or CWO_id.");
  }

  return prisma.expense.update({
    where: { expense_id: id },
    data: {
      ...(data.expense_type && { expense_type: data.expense_type }),
      ...(data.expense_frequency && {
        expense_frequency: data.expense_frequency,
      }),
      ...(data.expense_value && { expense_value: data.expense_value }),
      ...(data.expsense_currency && {
        expsense_currency: data.expsense_currency,
      }),
      ...(data.pro_rata_percentage !== undefined && {
        pro_rata_percentage: data.pro_rata_percentage,
      }),
      ...(data.PO_id !== undefined
        ? { purchase_order: { connect: { PO_id: data.PO_id } } }
        : {}),
      ...(data.CWO_id !== undefined
        ? { calloff_work_order: { connect: { CWO_id: data.CWO_id } } }
        : {}),
    },
  });
};

export const deleteExpense = async (id: string) => {
  return prisma.expense.delete({
    where: { expense_id: id },
  });
};

export const getAllExpenses = async () => {
  const expenses = await prisma.expense.findMany({
    include: {
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
    },
  });

  return expenses.map((expense) => {
    if (expense.purchase_order) {
      const { calloff_work_order, ...rest } = expense;
      return rest;
    } else if (expense.calloff_work_order) {
      const { purchase_order, ...rest } = expense;
      return rest;
    }
    return expense;
  });
};

export const createExpenses = async (
  data: Array<{
    PO_id?: string;
    CWO_id?: string;
    expense_type: expense_type;
    expense_frequency: expense_frequency;
    expense_value: number;
    expsense_currency: string;
    pro_rata_percentage: number;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const expenses = [];

    for (const expenseData of data) {
      if (
        (!expenseData.PO_id && !expenseData.CWO_id) ||
        (expenseData.PO_id && expenseData.CWO_id)
      ) {
        throw new Error("Exactly one of PO_id or CWO_id must be provided.");
      }

      const expense = await prisma.expense.create({
        data: {
          expense_type: expenseData.expense_type,
          expense_frequency: expenseData.expense_frequency,
          expense_value: expenseData.expense_value,
          expsense_currency: expenseData.expsense_currency,
          pro_rata_percentage: expenseData.pro_rata_percentage,
          ...(expenseData.PO_id
            ? { purchase_order: { connect: { PO_id: expenseData.PO_id } } }
            : {}),
          ...(expenseData.CWO_id
            ? {
                calloff_work_order: { connect: { CWO_id: expenseData.CWO_id } },
              }
            : {}),
        },
      });

      expenses.push(expense);
    }

    return expenses;
  });
};
