import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpense } from "../../../api/expense.api";
import { useToast } from "../../../providers/ToastProvider";

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      showToast("Expense deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to delete expense";
      showToast(msg, "error");
    },
  });
}
