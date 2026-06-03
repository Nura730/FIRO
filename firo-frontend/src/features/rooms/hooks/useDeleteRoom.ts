import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "../../../api/room.api";
import { useToast } from "../../../providers/ToastProvider";
import { useRoom } from "../../../providers/RoomProvider";

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { clearRoom } = useRoom();

  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      showToast("Room deleted successfully", "success");
      clearRoom();
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to delete room";
      showToast(msg, "error");
    },
  });
}
