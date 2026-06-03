import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveRoom } from "../../../api/room.api";
import { useToast } from "../../../providers/ToastProvider";
import { useRoom } from "../../../providers/RoomProvider";

export function useLeaveRoom() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { clearRoom } = useRoom();

  return useMutation({
    mutationFn: leaveRoom,
    onSuccess: () => {
      showToast("Left room successfully", "success");
      clearRoom();
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to leave room";
      showToast(msg, "error");
    },
  });
}
