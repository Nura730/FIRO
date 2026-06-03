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
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 pb-24 max-w-xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header / Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Hey, {currentUser?.name} 👋
            </h1>
            <p className="text-[#64748B] text-sm font-medium mt-1">
              Choose or manage your active room
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-red-500 bg-white border border-[#E2E8F0] shadow-sm px-3.5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* 1. Active Room Management Section */}
        {activeRoom && (
          <div className="space-y-3.5">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider pl-1">
              Active Room Details
            </h2>

            <Card className="p-6 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[24px]">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-bold text-2xl text-[#0F172A] tracking-tight">{activeRoom.name}</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-mono font-bold bg-[#F1F5F9] text-[#475569] px-3 py-1.5 rounded-xl w-fit">
                    Code: <span className="text-[#0F172A] font-extrabold">{activeRoom.inviteCode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#22C55E]/10 text-[#22C55E]">
                  <Shield size={12} />
                  Active
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Roommates ({activeMembers.length})
                </p>

                {loadingDetails ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-slate-50 rounded-xl" />
                    <div className="h-10 bg-slate-50 rounded-xl" />
                  </div>
                ) : (
                  <div className="space-y-2">
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
                          className="flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] rounded-[16px] transition-colors border border-transparent hover:border-slate-100"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] truncate">
                              {memberName} {isMe && "(You)"}
                            </p>
                            <p className="text-xs text-[#64748B] truncate">{memberEmail}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Role badge */}
                            <span
                              className={`text-[9px] font-extrabold tracking-wider px-2 py-1 rounded-lg uppercase ${
                                role === "OWNER"
                                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                                  : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              {role}
                            </span>

                            {/* Owner management buttons */}
                            {showActions && (
                              <div className="flex items-center gap-1.5 ml-1">
                                <button
                                  onClick={() => handleTransferOwnership(memberId, memberName)}
                                  title="Transfer ownership"
                                  className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-400 transition-colors"
                                  disabled={transferOwnershipMutation.isPending}
                                >
                                  <RefreshCw size={14} />
                                </button>
                                <button
                                  onClick={() => handleKickMember(memberId, memberName)}
                                  title="Kick member"
                                  className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                                  disabled={removeMemberMutation.isPending}
                                >
                                  <UserMinus size={14} />
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
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
                    disabled={deleteRoomMutation.isPending}
                  >
                    <Trash2 size={14} />
                    Delete Room
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveRoom}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
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
        <div className="space-y-3.5">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider pl-1">
            {activeRoom ? "Switch Rooms" : "Your Rooms"}
          </h2>

          {loadingMyRooms ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : otherRooms.length === 0 && rooms.length > 0 ? (
            <div className="text-xs font-medium text-[#64748B] p-5 border border-dashed border-[#E2E8F0] rounded-[24px] text-center bg-white">
              No other rooms joined.
            </div>
          ) : rooms.length === 0 ? (
            <div>
              <EmptyState
                icon={Users}
                title="No rooms found"
                description="Create a new room or join one with an invite code"
              />
            </div>
          ) : (
            <div className="grid gap-3.5 grid-cols-1">
              {otherRooms.map((roomItem: any, index: number) => (
                <motion.div
                  key={roomItem._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card
                    onClick={() => handleSelectRoom(roomItem)}
                    className="p-5 cursor-pointer hover:border-[#22C55E]/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all bg-white rounded-[24px]"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-base text-[#0F172A] tracking-tight">{roomItem.name}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-lg">
                            Code: {roomItem.inviteCode}
                          </p>
                          <p className="text-xs text-[#64748B] font-semibold flex items-center gap-1">
                            <Users size={12} className="text-[#64748B]" />
                            {roomItem.members?.length || 0} roommates
                          </p>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-3.5 py-2.5 rounded-xl active:scale-95 transition-all">
                        <ArrowLeftRight size={12} />
                        Switch
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <Button
              onClick={() => navigate("/rooms/create")}
              className="py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold transition-all"
            >
              <span className="flex items-center justify-center gap-1.5 text-sm">
                <Plus size={16} />
                Create Room
              </span>
            </Button>

            <Button
              onClick={() => navigate("/rooms/join")}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold py-3 rounded-xl transition-all"
            >
              <span className="flex items-center justify-center gap-1.5 text-sm">
                <KeyRound size={16} />
                Join Room
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}