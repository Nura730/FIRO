import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transferRoomOwnership } from "../../../api/room.api";
import { useToast } from "../../../providers/ToastProvider";

export function useTransferOwnership() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ roomId, newOwnerId }: { roomId: string; newOwnerId: string }) =>
      transferRoomOwnership(roomId, newOwnerId),
    onSuccess: (_, variables) => {
      showToast("Ownership transferred successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to transfer ownership";
      showToast(msg, "error");
    },
  });
}
