import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthProvider";
import { getRoomMembers } from "../api/room.api";

interface RoomData {
  roomId: string;
  roomName: string;
  inviteCode: string;
}

interface RoomContextType {
  room: RoomData | null;
  selectRoom: (room: RoomData) => void;
  clearRoom: () => void;
}

const RoomContext =
  createContext<RoomContextType | null>(null);

export function RoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const [room, setRoom] = useState<RoomData | null>(() => {
    const storedRoom = localStorage.getItem("firo_room");
    const activeRoomId = localStorage.getItem("firo_active_room_id");
    
    if (!activeRoomId) return null;
    
    try {
      if (storedRoom) {
        const parsed = JSON.parse(storedRoom);
        if (parsed.roomId === activeRoomId) return parsed;
      }
      // Fallback if firo_room is missing but id is present
      return { roomId: activeRoomId, roomName: "", inviteCode: "" };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token) {
      setRoom(null);
      return;
    }

    if (room?.roomId) {
      // Verify room exists on backend
      getRoomMembers(room.roomId)
        .then((res) => {
          if (res && res.data) {
            const updatedData = {
              roomId: res.data._id,
              roomName: res.data.name,
              inviteCode: res.data.inviteCode,
            };
            // Update state with verified complete info
            setRoom(updatedData);
            localStorage.setItem("firo_room", JSON.stringify(updatedData));
            localStorage.setItem("firo_active_room_id", res.data._id);
          } else {
            clearRoom();
          }
        })
        .catch(() => {
          clearRoom();
        });
    }
  }, [token]);

  const selectRoom = (
    roomData: RoomData
  ) => {
    localStorage.setItem(
      "firo_room",
      JSON.stringify(roomData)
    );
    localStorage.setItem(
      "firo_active_room_id",
      roomData.roomId
    );

    setRoom(roomData);
  };

  const clearRoom = () => {
    localStorage.removeItem("firo_room");
    localStorage.removeItem("firo_active_room_id");

    setRoom(null);
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        selectRoom,
        clearRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context =
    useContext(RoomContext);

  if (!context) {
    throw new Error(
      "useRoom must be used inside RoomProvider"
    );
  }

  return context;
}