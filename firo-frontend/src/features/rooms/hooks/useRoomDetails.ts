import { useQuery } from "@tanstack/react-query";
import { getRoomMembers } from "../../../api/room.api";

export function useRoomDetails(roomId: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoomMembers(roomId),
    enabled: !!roomId,
  });
}
