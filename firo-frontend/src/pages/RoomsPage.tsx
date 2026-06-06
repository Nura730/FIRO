import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface Room {
  _id: string;
  name: string;
  inviteCode: string;
  members: {
    userId: string;
    role: "OWNER" | "MEMBER";
  }[];
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] =
    useState(true);

  const [roomName, setRoomName] =
    useState("");

  const [inviteCode, setInviteCode] =
    useState("");

  const fetchRooms = async () => {
    try {
      const response =
        await api.get("/rooms/my-rooms");

      console.log(response.data);

      setRooms(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const createRoom = async () => {
    if (!roomName.trim()) return;

    try {
      await api.post("/rooms/create", {
        name: roomName,
      });

      setRoomName("");
      fetchRooms();
    } catch (error) {
      console.error(error);
    }
  };

  const joinRoom = async () => {
    if (!inviteCode.trim()) return;

    try {
      await api.post("/rooms/join", {
        inviteCode,
      });

      setInviteCode("");
      fetchRooms();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        Rooms
      </h1>

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold">
          Create Room
        </h2>

        <input
          value={roomName}
          onChange={(e) =>
            setRoomName(e.target.value)
          }
          placeholder="Room name"
          className="mb-3 w-full rounded-xl bg-zinc-800 p-3"
        />

        <button
          onClick={createRoom}
          className="w-full rounded-xl bg-lime-500 p-3 font-semibold text-black"
        >
          Create
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold">
          Join Room
        </h2>

        <input
          value={inviteCode}
          onChange={(e) =>
            setInviteCode(
              e.target.value
            )
          }
          placeholder="Invite code"
          className="mb-3 w-full rounded-xl bg-zinc-800 p-3"
        />

        <button
          onClick={joinRoom}
          className="w-full rounded-xl bg-blue-500 p-3 font-semibold"
        >
          Join
        </button>
      </div>

      <div className="space-y-4">
        {rooms.map((room) => (
          <div
  key={room._id}
  onClick={() =>
    navigate(`/rooms/${room._id}`)
  }
  className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-lime-500"
>
            <h3 className="text-xl font-semibold">
              {room.name}
            </h3>

            <p className="mt-2 text-zinc-400">
              Members:
              {" "}
              {room.members.length}
            </p>

            <p className="text-zinc-400">
              Code:
              {" "}
              {room.inviteCode}
            </p>
          </div>
        ))}
        
      </div>
    </div>
    
  );
}