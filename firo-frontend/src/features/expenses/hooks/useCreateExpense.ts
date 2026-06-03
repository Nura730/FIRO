import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "../../../api/expense.api";
import { useToast } from "../../../providers/ToastProvider";

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      showToast("Expense added successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to add expense";
      showToast(msg, "error");
    },
  });
}
