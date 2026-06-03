import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LogOut, KeyRound, Users, Shield, UserMinus, RefreshCw, Trash2, ArrowLeftRight } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { CardSkeleton } from "../../../components/ui/Skeleton";

import { useAuth } from "../../../providers/AuthProvider";
import { useRoom } from "../../../providers/RoomProvider";
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
    navigate("/dashboard");
  };

  const handleLogout = () => {
    clearRoom();
    logout();
    navigate("/login");
  };

  const handleKickMember = (targetUserId: string, targetName: string) => {
    if (window.confirm(`Are you sure you want to kick ${targetName} from the room?`)) {
      removeMemberMutation.mutate({ roomId, userId: targetUserId });
    }
  };

  const handleTransferOwnership = (targetUserId: string, targetName: string) => {
    if (
      window.confirm(
        `Are you sure you want to transfer room ownership to ${targetName}? You will become a regular member.`
      )
    ) {
      transferOwnershipMutation.mutate({ roomId, newOwnerId: targetUserId });
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to leave this room? Your splits will remain, but you won't access it.")) {
      leaveRoomMutation.mutate(roomId);
    }
  };

  const handleDeleteRoom = () => {
    if (
      window.confirm(
        "DANGER: Are you sure you want to delete this room? This will permanently erase all expenses, splits, and settlements."
      )
    ) {
      deleteRoomMutation.mutate(roomId);
    }
  };

  const otherRooms = rooms.filter((r: any) => r._id !== roomId);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 pb-20 no-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {currentUser?.name}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your shared expenses
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors py-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* 1. Active Room Management Section */}
        {activeRoom && (
          <div className="mb-8">
            <h2 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">
              Active Room Details
            </h2>

            <Card className="p-5 border-green-200 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{activeRoom.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg w-fit">
                    Code: <span className="font-bold">{activeRoom.inviteCode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                  <Shield size={12} />
                  Active Room
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Roommates ({activeMembers.length})
                </p>

                {loadingDetails ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-8 bg-slate-100 rounded-lg" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-2.5">
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
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {memberName} {isMe && "(You)"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{memberEmail}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Role badge */}
                            <span
                              className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase ${
                                role === "OWNER"
                                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {role}
                            </span>

                            {/* Owner management buttons */}
                            {showActions && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleTransferOwnership(memberId, memberName)}
                                  title="Transfer ownership"
                                  className="p-1 hover:bg-amber-50 hover:text-amber-600 rounded text-slate-400 transition-colors"
                                  disabled={transferOwnershipMutation.isPending}
                                >
                                  <RefreshCw size={13} />
                                </button>
                                <button
                                  onClick={() => handleKickMember(memberId, memberName)}
                                  title="Kick member"
                                  className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition-colors"
                                  disabled={removeMemberMutation.isPending}
                                >
                                  <UserMinus size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leave or Delete Room action button */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                {isOwnerOfActiveRoom ? (
                  <button
                    onClick={handleDeleteRoom}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 px-3 py-2 hover:bg-red-50 rounded-xl transition-all"
                    disabled={deleteRoomMutation.isPending}
                  >
                    <Trash2 size={14} />
                    Delete Room
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveRoom}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 px-3 py-2 hover:bg-red-50 rounded-xl transition-all"
                    disabled={leaveRoomMutation.isPending}
                  >
                    <LogOut size={14} />
                    Leave Room
                  </button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 2. Room Switch / Selection list */}
        <div>
          <h2 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">
            {activeRoom ? "Switch Rooms" : "Select Room"}
          </h2>

          {loadingMyRooms ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : otherRooms.length === 0 && rooms.length > 0 ? (
            <div className="text-xs font-medium text-slate-400 p-4 border border-dashed border-slate-200 rounded-2xl text-center bg-white mb-4">
              No other rooms available
            </div>
          ) : rooms.length === 0 ? (
            <div className="mb-4">
              <EmptyState
                icon={Users}
                title="No rooms found"
                description="Create a new room or join one with an invite code"
              />
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {otherRooms.map((roomItem: any, index: number) => (
                <motion.div
                  key={roomItem._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card
                    onClick={() => handleSelectRoom(roomItem)}
                    className="p-4 cursor-pointer hover:border-green-300 transition-all bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800">{roomItem.name}</h4>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          Code: {roomItem.inviteCode}
                        </p>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                        <ArrowLeftRight size={11} />
                        Switch
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button onClick={() => navigate("/rooms/create")} className="py-2.5">
              <span className="flex items-center justify-center gap-1.5 text-sm">
                <Plus size={16} />
                Create Room
              </span>
            </Button>

            <Button
              onClick={() => navigate("/rooms/join")}
              className="bg-slate-700 py-2.5"
            >
              <span className="flex items-center justify-center gap-1.5 text-sm">
                <KeyRound size={16} />
                Join Code
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}