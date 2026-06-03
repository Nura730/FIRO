import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { joinRoom } from "../../../api/room.api";
import { useRoom } from "../../../providers/RoomProvider";
import { useToast } from "../../../providers/ToastProvider";

export function useJoinRoom() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectRoom } = useRoom();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (inviteCode: string) => joinRoom(inviteCode),

    onSuccess: (response) => {
      const room = response.data;

      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      selectRoom({
        roomId: room._id,
        roomName: room.name,
        inviteCode: room.inviteCode,
      });

      showToast("Joined room!", "success");
      navigate("/dashboard");
    },

    onError: () => {
      showToast("Failed to join room. Check the invite code.", "error");
    },
  });
}
