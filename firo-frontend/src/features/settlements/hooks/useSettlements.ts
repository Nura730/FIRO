import { useQuery } from "@tanstack/react-query";

import { getSettlements } from "../../../api/settlement.api";

export function useSettlements(roomId: string) {
  return useQuery({
    queryKey: ["settlements", roomId],
    queryFn: () => getSettlements(roomId),
    enabled: !!roomId,
  });
}
