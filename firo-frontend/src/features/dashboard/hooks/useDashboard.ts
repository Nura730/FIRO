import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../../api/dashboard.api";

export function useDashboard(roomId: string) {
  return useQuery({
    queryKey: ["dashboard", roomId],
    queryFn: () => getDashboard(roomId),
    enabled: !!roomId,
  });
}