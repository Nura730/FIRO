import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeRoomMember } from "../../../api/room.api";
import { useToast } from "../../../providers/ToastProvider";

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      removeRoomMember(roomId, userId),
    onSuccess: (_, variables) => {
      showToast("Roommate removed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["settlements", variables.roomId] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to remove member";
      showToast(msg, "error");
    },
  });
}
