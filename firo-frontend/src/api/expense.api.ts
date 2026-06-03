import { api } from "./axios";

export const getExpenses = async (roomId: string, category?: string) => {
  const { data } = await api.get(`/expenses/room/${roomId}`, {
    params: { category },
  });
  return data;
};

export const createExpense = async (payload: {
  roomId: string;
  title: string;
  amount: number;
  category: string;
  splits: Array<{ userId: string; amount: number }>;
  isSettlement?: boolean;
}) => {
  const { data } = await api.post("/expenses", payload);
  return data;
};

export const updateExpense = async (
  expenseId: string,
  payload: {
    title: string;
    amount: number;
    category: string;
    splits: Array<{ userId: string; amount: number }>;
    isSettlement?: boolean;
  }
) => {
  const { data } = await api.put(`/expenses/${expenseId}`, payload);
  return data;
};

export const deleteExpense = async (expenseId: string) => {
  const { data } = await api.delete(`/expenses/${expenseId}`);
  return data;
};