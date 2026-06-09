import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

import {
  CaretDown,
  CaretUp,
  Plus,
  Users,
  Copy,
  ArrowRight,
} from "phosphor-react";

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

  const [showCreate, setShowCreate] =
    useState(false);

  const [showJoin, setShowJoin] =
    useState(false);

  const fetchRooms = async () => {
    try {
      const response =
        await api.get("/rooms/my-rooms");

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
      setShowCreate(false);

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
      setShowJoin(false);

      fetchRooms();
    } catch (error) {
      console.error(error);
    }
  };

  const copyCode = async (
    code: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      alert("Invite code copied");
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
    <div className="min-h-screen bg-black p-4 pb-24 text-white">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Workspaces
        </h1>

        <p className="mt-2 text-zinc-400">
          {rooms.length} Active Workspace
          {rooms.length !== 1 && "s"}
        </p>
      </div>

      {/* Create Workspace */}

      <div className="mb-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        <button
          onClick={() =>
            setShowCreate(
              !showCreate
            )
          }
          className="flex w-full items-center justify-between p-5"
        >
          <div className="flex items-center gap-3">
            <Plus
              size={22}
              className="text-lime-400"
            />

            <span className="font-medium">
              Create Workspace
            </span>
          </div>

          {showCreate ? (
            <CaretUp size={18} />
          ) : (
            <CaretDown size={18} />
          )}
        </button>

        {showCreate && (
          <div className="border-t border-zinc-800 p-5">
            <input
              value={roomName}
              onChange={(e) =>
                setRoomName(
                  e.target.value
                )
              }
              placeholder="Workspace name"
              className="mb-3 w-full rounded-xl bg-zinc-800 p-3"
            />

            <button
              onClick={createRoom}
              className="w-full rounded-xl bg-lime-500 p-3 font-semibold text-black"
            >
              Create Workspace
            </button>
          </div>
        )}
      </div>

      {/* Join Workspace */}

      <div className="mb-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        <button
          onClick={() =>
            setShowJoin(!showJoin)
          }
          className="flex w-full items-center justify-between p-5"
        >
          <div className="flex items-center gap-3">
            <Users
              size={22}
              className="text-lime-400"
            />

            <span className="font-medium">
              Join Workspace
            </span>
          </div>

          {showJoin ? (
            <CaretUp size={18} />
          ) : (
            <CaretDown size={18} />
          )}
        </button>

        {showJoin && (
          <div className="border-t border-zinc-800 p-5">
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
              Join Workspace
            </button>
          </div>
        )}
      </div>

      {/* Workspace Cards */}

      <div className="space-y-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {room.name}
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                {room.members.length} Members
              </p>
            </div>

            <div className="mb-4 rounded-2xl bg-zinc-800 p-3">
              <p className="text-xs text-zinc-400">
                Invite Code
              </p>

              <p className="mt-1 font-mono text-lg font-bold text-lime-400">
                {room.inviteCode}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate(
                    `/rooms/${room._id}`
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime-500 p-3 font-semibold text-black"
              >
                Open
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() =>
                  copyCode(
                    room.inviteCode
                  )
                }
                className="rounded-xl border border-zinc-700 px-4"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!rooms.length && (
        <div className="mt-10 text-center text-zinc-500">
          No workspaces yet
        </div>
      )}
    </div>
  );
}