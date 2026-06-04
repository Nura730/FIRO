import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound } from "lucide-react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useJoinRoom } from "../hooks/useJoinRoom";

export default function JoinRoomPage() {
  const [inviteCode, setInviteCode] = useState("");
  const joinMutation = useJoinRoom();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinMutation.mutate(inviteCode.trim().toUpperCase());
  };

  return (
    <div className="relative min-h-screen w-full bg-[#04010a] text-slate-100 flex items-center justify-center sm:py-8 overflow-hidden noise-overlay">
      {/* 1. Animated Ambient Lights in the background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[100px] animate-float-slow" />
        <div className="absolute top-[35%] left-[20%] h-[300px] w-[300px] rounded-full bg-violet-500/15 blur-[90px] animate-float-medium" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[350px] w-[350px] rounded-full bg-emerald-500/15 blur-[100px] animate-float-slow" />
      </div>

      {/* 2. Technical digital Grid overlay */}
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-50 z-0" />

      {/* 3. Simulated Device Mock Frame */}
      <div className="relative z-10 w-full max-w-md min-h-screen sm:min-h-0 sm:h-[820px] sm:rounded-[36px] sm:border sm:border-white/10 sm:bg-black/35 sm:backdrop-blur-xl sm:shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_2px_rgba(255,255,255,0.1),inset 0 0 24px rgba(255,255,255,0.01)] flex flex-col justify-center px-6 py-12 sm:px-8 sm:py-10 overflow-hidden">
        
        {/* Device Notch element for luxury visual detail */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-b-xl border-x border-b border-white/5 z-50 items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-950" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full max-w-sm mx-auto space-y-5.5 relative"
        >
          <Link
            to="/rooms"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-2 uppercase tracking-wider pl-1"
          >
            <ArrowLeft size={14} />
            Back to rooms
          </Link>

          <div className="glass-panel border border-white/12 rounded-[32px] p-7 space-y-6 bg-white/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">Join Room</h1>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                Enter the invite code shared by your roommate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Invite Code"
                placeholder="e.g. K3LIF1GQ"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="uppercase font-mono text-center text-lg font-black"
                startIcon={<KeyRound className="w-4 h-4 text-emerald-400" />}
                required
              />

              {joinMutation.isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs font-semibold text-rose-300"
                >
                  Invalid invite code. Please check and try again.
                </motion.div>
              )}

              <Button
                type="submit"
                loading={joinMutation.isPending}
                className="h-13 w-full rounded-2xl text-sm font-bold mt-2"
              >
                Join Room
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
