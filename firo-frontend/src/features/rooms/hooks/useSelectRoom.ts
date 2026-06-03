import { useNavigate } from "react-router-dom";

import { useRoom } from "../../../providers/RoomProvider";

export function useSelectRoom() {
  const navigate = useNavigate();

  const { selectRoom } =
    useRoom();

  const handleSelectRoom = (
    roomId: string,
    roomName: string,
    inviteCode: string
  ) => {
    selectRoom({
      roomId,
      roomName,
      inviteCode,
    });

    navigate("/");
  };

  return {
    handleSelectRoom,
  };
}