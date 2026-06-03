import { useQuery } from "@tanstack/react-query";

import { getExpenses } from "../../../api/expense.api";

export function useExpenses(roomId: string) {
  return useQuery({
    queryKey: ["expenses", roomId],
    queryFn: () => getExpenses(roomId),
    enabled: !!roomId,
  });
}
