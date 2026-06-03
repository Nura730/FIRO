import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LogOut, KeyRound, UserMinus, RefreshCw, Trash2, ChevronRight, Check } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";

import { useAuth } from "../../../providers/AuthProvider";
import { useRoom } from "../../../providers/RoomProvider";
import { useToast } from "../../../providers/ToastProvider";
import { useMyRooms } from "../hooks/useMyRooms";
import { useRoomDetails } from "../hooks/useRoomDetails";
import { useRemoveMember } from "../hooks/useRemoveMember";
import { useTransferOwnership } from "../hooks/useTransferOwnership";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import { useDeleteRoom } from "../hooks/useDeleteRoom";

export default function RoomSelectionPage() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const { selectRoom, clearRoom, room: activeRoomState } = useRoom();
  const { showToast } = useToast();
  const { data: myRoomsRes, isLoading: loadingMyRooms } = useMyRooms();

  // Active room queries & mutations
  const roomId = activeRoomState?.roomId || "";
  const { data: roomDetailsRes, isLoading: loadingDetails } = useRoomDetails(roomId);
  const removeMemberMutation = useRemoveMember();
  const transferOwnershipMutation = useTransferOwnership();
  const leaveRoomMutation = useLeaveRoom();
  const deleteRoomMutation = useDeleteRoom();

  const rooms = myRoomsRes?.data || [];
  const activeRoom = roomDetailsRes?.data;
  const isOwnerOfActiveRoom = activeRoom && activeRoom.ownerId === currentUser?.id;
  const activeMembers = activeRoom?.members || [];

  const handleSelectRoom = (room: any) => {
    selectRoom({
      roomId: room._id,
      roomName: room.name,
      inviteCode: room.inviteCode,
    });
    showToast(`Switched to: ${room.name}`, "success");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    clearRoom();
    logout();
    showToast("Logged out successfully", "success");
    navigate("/login");
  };

  const handleKickMember = (targetUserId: string, targetName: string) => {
    if (window.confirm(`Are you sure you want to kick ${targetName}?`)) {
      removeMemberMutation.mutate(
        { roomId, userId: targetUserId },
        {
          onSuccess: () => showToast(`Kicked ${targetName}`, "success"),
          onError: () => showToast("Failed to kick member", "error"),
        }
      );
    }
  };

  const handleTransferOwnership = (targetUserId: string, targetName: string) => {
    if (window.confirm(`Transfer ownership to ${targetName}? You will become a regular roommate.`)) {
      transferOwnershipMutation.mutate(
        { roomId, newOwnerId: targetUserId },
        {
          onSuccess: () => showToast(`Ownership transferred to ${targetName}`, "success"),
          onError: () => showToast("Failed to transfer ownership", "error"),
        }
      );
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Leave this room? Your recorded splits will remain intact.")) {
      leaveRoomMutation.mutate(roomId, {
        onSuccess: () => {
          showToast("Left the room", "success");
          clearRoom();
        },
        onError: () => showToast("Failed to leave room", "error"),
      });
    }
  };

  const handleDeleteRoom = () => {
    if (window.confirm("DANGER: Permanently delete this room? All expenses and splits will be deleted forever.")) {
      deleteRoomMutation.mutate(roomId, {
        onSuccess: () => {
          showToast("Room permanently deleted", "success");
          clearRoom();
        },
        onError: () => showToast("Failed to delete room", "error"),
      });
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "GOOD MORNING";
    if (hours < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  return (
   <div className="w-full py-4 space-y-6">
      {/* 1. Brand Greeting Header */}
      <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-start justify-between"
>
  <div>
    <p className="text-xs uppercase tracking-[0.3em] text-[#22C55E] font-bold">
      {getGreeting()}
    </p>

    <h1 className="mt-2 text-4xl font-black text-white">
      Rooms
    </h1>

    <p className="mt-1 text-sm text-zinc-400">
      Manage your shared expense spaces.
    </p>
  </div>

  <Button
    variant="outline"
    size="sm"
    onClick={handleLogout}
    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
  >
    <LogOut size={14} />
    Logout
  </Button>
</motion.div>

      {/* 2. Room Switcher Section */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase pl-0.5">
          Select Room
        </span>

        {loadingMyRooms ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No rooms joined"
            description="Create a new room or join an existing one using an invite code."
          />
        ) : (
          <div className="space-y-3.5">
            {rooms.map((r: any) => {
              const isActive = activeRoomState?.roomId === r._id;

              return (
                <Card
                  key={r._id}
                  onClick={() => handleSelectRoom(r)}
                  className={`cursor-pointer border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-[#22C55E]/30 ${
                    isActive ? "border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.15)]" : ""
                  }`}
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-base text-white truncate">
                        {r.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-semibold">
                        {r.members?.length || 1} roommate{(r.members?.length || 1) !== 1 ? "s" : ""} • Code: {r.inviteCode}
                      </p>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isActive ? (
                        <div className="w-7 h-7 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] border border-[#22C55E]/20">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      ) : (
                        <ChevronRight size={18} className="text-zinc-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Rooms Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
  onClick={() => navigate("/rooms/create")}
  className="h-14 rounded-2xl bg-[#22C55E] font-bold"
>
  <Plus size={16} />
  Create Room
</Button>

        <Button
  variant="outline"
  onClick={() => navigate("/rooms/join")}
  className="h-14 rounded-2xl border-white/10 bg-white/5 text-white"
>
  <KeyRound size={16} />
  Join Room
</Button>
      </div>

      {/* 4. Room Members & Settings */}
      {activeRoom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-4 pt-4"
        >
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase pl-0.5">
            Active Room settings ({activeRoom.name})
          </span>

          <Card
            className="border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <CardContent className="p-0 divide-y divide-white/10">
              {/* Copy Invite Code widget */}
              <div className="flex justify-between items-center p-5">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Invite Code</p>
                  <p className="font-mono text-base font-extrabold text-white">{activeRoom.inviteCode}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoom.inviteCode);
                    showToast("Invite code copied!", "success");
                  }}
                  className="font-bold"
                >
                  Copy Code
                </Button>
              </div>

              {/* Members List */}
              <div className="p-5 space-y-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Roommates list</p>

                {loadingDetails ? (
                  <div className="space-y-2 animate-pulse">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeMembers.map((m: any, idx: number) => {
                      const memberId = m.userId?._id || m.userId;
                      const memberName = m.userId?.name || "Unknown";
                      const memberEmail = m.userId?.email || "";
                      const role = m.role;

                      const isMe = memberId === currentUser?.id;
                      const showActions = isOwnerOfActiveRoom && !isMe;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {memberName} {isMe && "(You)"}
                            </p>
                            <p className="text-xs text-zinc-400 font-medium truncate">{memberEmail}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase ${
                                role === "OWNER"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-white/5 text-zinc-400 border border-white/10"
                              }`}
                            >
                              {role}
                            </span>

                            {showActions && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTransferOwnership(memberId, memberName)}
                                  title="Transfer ownership"
                                  className="h-8 w-8 p-0"
                                >
                                  <RefreshCw size={12} className="text-zinc-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleKickMember(memberId, memberName)}
                                  title="Kick roommate"
                                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                >
                                  <UserMinus size={12} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Destructive actions */}
              <div className="p-5 flex justify-end">
                {isOwnerOfActiveRoom ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteRoom}
                    disabled={deleteRoomMutation.isPending}
                    className="font-bold flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Delete Room Permanently
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveRoom}
                    disabled={leaveRoomMutation.isPending}
                    className="font-bold flex items-center gap-1.5"
                  >
                    <LogOut size={13} />
                    Leave Room
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}