import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LogOut, KeyRound, UserMinus, RefreshCw, Trash2, ChevronRight, Check, Copy } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

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

  // Custom confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const triggerConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    isDestructive = false,
    confirmText = "Confirm"
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      confirmText,
      isDestructive,
      onConfirm,
    });
  };

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
    triggerConfirm(
      "Kick Roommate?",
      `Are you sure you want to remove ${targetName} from the room? Their recorded expenses will remain, but they will lose access.`,
      () => {
        removeMemberMutation.mutate(
          { roomId, userId: targetUserId },
          {
            onSuccess: () => showToast(`Kicked ${targetName}`, "success"),
            onError: () => showToast("Failed to kick member", "error"),
          }
        );
      },
      true,
      "Kick Roommate"
    );
  };

  const handleTransferOwnership = (targetUserId: string, targetName: string) => {
    triggerConfirm(
      "Transfer Ownership?",
      `Do you want to make ${targetName} the owner of this room? You will become a regular roommate and lose admin controls.`,
      () => {
        transferOwnershipMutation.mutate(
          { roomId, newOwnerId: targetUserId },
          {
            onSuccess: () => showToast(`Ownership transferred to ${targetName}`, "success"),
            onError: () => showToast("Failed to transfer ownership", "error"),
          }
        );
      },
      false,
      "Transfer"
    );
  };

  const handleLeaveRoom = () => {
    triggerConfirm(
      "Leave Room?",
      "Are you sure you want to leave this room? Your recorded splits and settlements will remain intact.",
      () => {
        leaveRoomMutation.mutate(roomId, {
          onSuccess: () => {
            showToast("Left the room", "success");
            clearRoom();
          },
          onError: () => showToast("Failed to leave room", "error"),
        });
      },
      true,
      "Leave Room"
    );
  };

  const handleDeleteRoom = () => {
    triggerConfirm(
      "Delete Room Permanently?",
      "DANGER: This action cannot be undone. All expenses, splits, settlements, and member lists will be permanently deleted.",
      () => {
        deleteRoomMutation.mutate(roomId, {
          onSuccess: () => {
            showToast("Room permanently deleted", "success");
            clearRoom();
          },
          onError: () => showToast("Failed to delete room", "error"),
        });
      },
      true,
      "Delete Room"
    );
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "GOOD MORNING";
    if (hours < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  // Helper to generate initials avatar style
  const getAvatarStyle = (name: string) => {
    const colors = [
      "from-emerald-500/20 to-teal-500/10 text-emerald-450 border-emerald-500/20",
      "from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20",
      "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20",
      "from-pink-500/20 to-rose-500/10 text-pink-400 border-rose-500/20",
      "from-amber-500/20 to-orange-500/10 text-amber-450 border-amber-500/20",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-12">
      {/* 1. Header Row */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="flex items-center justify-between pl-1"
      >
        <div>
          <span className="text-[10px] font-black tracking-[0.25em] text-emerald-450 uppercase">
            {getGreeting()}
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white font-heading">
            Ledger Rooms
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-9 px-4 rounded-xl text-xs font-bold border-white/5 bg-white/3 hover:bg-white/10"
        >
          <LogOut size={13} />
          <span>Logout</span>
        </Button>
      </motion.div>

      {/* 2. Room Switcher Section */}
      <div className="space-y-3.5">
        <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase pl-1">
          Select Active Room
        </span>

        {loadingMyRooms ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-[24px]" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No rooms joined"
            description="Create a new room ledger or join an existing one using an invite code."
          />
        ) : (
          <div className="space-y-3">
            {rooms.map((r: any) => {
              const isActive = activeRoomState?.roomId === r._id;

              return (
                <motion.div
                  key={r._id}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleSelectRoom(r)}
                  className={`cursor-pointer rounded-[24px] overflow-hidden glass-panel transition-all duration-300 ${
                    isActive 
                      ? "border-emerald-500/40 bg-emerald-500/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.1)] glow-card-emerald" 
                      : "hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between p-5 relative">
                    {/* Glowing highlight in active card */}
                    {isActive && (
                      <div className="absolute top-0 right-10 h-10 w-24 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />
                    )}

                    <div className="min-w-0 space-y-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white truncate">
                          {r.name}
                        </h4>
                        {isActive && (
                          <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                        <span>{r.members?.length || 1} Roommate{(r.members?.length || 1) !== 1 ? "s" : ""}</span>
                        <span className="text-white/10">•</span>
                        <span className="font-mono font-bold tracking-wider text-emerald-450 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10px]">
                          {r.inviteCode}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0 ml-3 relative z-10">
                      {isActive ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-450 border border-emerald-500/20 shadow-inner">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/3 flex items-center justify-center text-slate-450 border border-white/5">
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Rooms Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <Button
          onClick={() => navigate("/rooms/create")}
          className="h-13 rounded-2xl text-sm font-bold shadow-md"
        >
          <Plus size={16} />
          Create Room
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/rooms/join")}
          className="h-13 rounded-2xl text-sm font-bold"
        >
          <KeyRound size={16} />
          Join Room
        </Button>
      </div>

      {/* 4. Active Room Settings & Member List */}
      {activeRoom && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
          className="space-y-3.5 pt-2"
        >
          <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase pl-1">
            Room Ledger Settings ({activeRoom.name})
          </span>

          <Card className="border-white/10 bg-white/[0.02] shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
            <CardContent className="p-0 divide-y divide-white/[0.06]">
              {/* Copy Invite Code banner */}
              <div className="flex justify-between items-center p-5 bg-white/[0.01]">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Share Invite Code</p>
                  <p className="font-mono text-lg font-black tracking-widest text-white flex items-center gap-1.5">
                    <span>{activeRoom.inviteCode}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoom.inviteCode);
                    showToast("Invite code copied!", "success");
                  }}
                  className="h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy size={12} />
                  <span>Copy Code</span>
                </Button>
              </div>

              {/* Members List Section */}
              <div className="p-5 space-y-4">
                <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Roommates List</p>

                {loadingDetails ? (
                  <div className="space-y-3 animate-pulse">
                    <Skeleton className="h-10 w-full rounded-xl" />
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
                      const avatarClass = getAvatarStyle(memberName);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-b-0"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Initials Avatar Plate */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs bg-gradient-to-tr ${avatarClass} border shadow-sm`}>
                              {getInitials(memberName)}
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm font-bold text-white truncate">
                                {memberName} {isMe && <span className="text-emerald-450">(You)</span>}
                              </p>
                              <p className="text-[10px] text-slate-450 font-semibold truncate">{memberEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 ml-3">
                            <span
                              className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase ${
                                role === "OWNER"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-white/5 text-slate-450 border border-white/5"
                              }`}
                            >
                              {role}
                            </span>

                            {showActions && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTransferOwnership(memberId, memberName)}
                                  title="Transfer ownership"
                                  className="h-8 w-8 p-0 hover:bg-white/5 rounded-lg flex items-center justify-center"
                                >
                                  <RefreshCw size={11} className="text-slate-400 hover:text-white" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleKickMember(memberId, memberName)}
                                  title="Kick roommate"
                                  className="h-8 w-8 p-0 hover:bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center"
                                >
                                  <UserMinus size={11} />
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

              {/* Delete / Leave room action bar */}
              <div className="p-5">
                {isOwnerOfActiveRoom ? (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRoom}
                    disabled={deleteRoomMutation.isPending}
                    className="w-full h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Delete Room Permanently
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleLeaveRoom}
                    disabled={leaveRoomMutation.isPending}
                    className="w-full h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={14} />
                    Leave Room
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Confirmation Dialog Alert */}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        isDestructive={confirmConfig.isDestructive}
      />
    </div>
  );
}