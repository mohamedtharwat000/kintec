import { prisma } from "@/lib/prisma";
import { Expense, ExpenseView, APIExpenseData } from "@/types/Expense";

export const getAllExpenses = async (): Promise<ExpenseView[]> => {
  return prisma.expense.findMany({
    include: {
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
    },
  });
};

export const getExpenseById = async (
  id: string
): Promise<ExpenseView | null> => {
  return prisma.expense.findUnique({
    where: { expense_id: id },
    include: {
      purchase_order: true,
      calloff_work_order: true,
      validation_rules: true,
    },
  });
};

export const deleteExpense = async (id: string): Promise<Expense> => {
  return prisma.expense.delete({
    where: { expense_id: id },
  });
};

export const updateExpense = async (
  id: string,
  data: Partial<Expense>
): Promise<Expense> => {
  return prisma.expense.update({
    where: { expense_id: id },
    data,
  });
};

export const createExpense = async (
  data: APIExpenseData | APIExpenseData[]
): Promise<Expense[]> => {
  const receivedData: APIExpenseData[] = Array.isArray(data) ? data : [data];

  receivedData.forEach((rate) => {
    if ((!rate.PO_id && !rate.CWO_id) || (rate.PO_id && rate.CWO_id)) {
      throw new Error("Exactly one of PO_id or CWO_id must be provided.");
    }
  });

  return Promise.all(
    receivedData.map((expense) => {
      if (expense.expense_id === "") expense.expense_id = undefined;
      if (expense.PO_id === "") expense.PO_id = null;
      if (expense.CWO_id === "") expense.CWO_id = null;

      return prisma.expense.create({
        data: expense,
      });
    })
  );
};
