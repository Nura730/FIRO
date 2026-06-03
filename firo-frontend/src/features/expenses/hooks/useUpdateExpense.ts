import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpense } from "../../../api/expense.api";
import { useToast } from "../../../providers/ToastProvider";

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ expenseId, payload }: { expenseId: string; payload: any }) =>
      updateExpense(expenseId, payload),
    onSuccess: () => {
      showToast("Expense updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to update expense";
      showToast(msg, "error");
    },
  });
}
