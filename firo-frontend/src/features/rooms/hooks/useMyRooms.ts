import { useQuery } from "@tanstack/react-query";

import { getMyRooms } from "../../../api/room.api";

export function useMyRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: getMyRooms,
  });
}