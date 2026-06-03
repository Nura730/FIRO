import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { createRoom } from "../../../api/room.api";
import { useRoom } from "../../../providers/RoomProvider";
import { useToast } from "../../../providers/ToastProvider";

export function useCreateRoom() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectRoom } = useRoom();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (name: string) => createRoom(name),

    onSuccess: (response) => {
      const room = response.data;

      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      selectRoom({
        roomId: room._id,
        roomName: room.name,
        inviteCode: room.inviteCode,
      });

      showToast("Room created!", "success");
      navigate("/dashboard");
    },

    onError: () => {
      showToast("Failed to create room", "error");
    },
  });
}
