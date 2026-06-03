import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
  const [room, setRoom] =
    useState<RoomData | null>(null);

  useEffect(() => {
    const storedRoom =
      localStorage.getItem("firo_room");

    if (storedRoom) {
      setRoom(JSON.parse(storedRoom));
    }
  }, []);

  const selectRoom = (
    roomData: RoomData
  ) => {
    localStorage.setItem(
      "firo_room",
      JSON.stringify(roomData)
    );

    setRoom(roomData);
  };

  const clearRoom = () => {
    localStorage.removeItem(
      "firo_room"
    );

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