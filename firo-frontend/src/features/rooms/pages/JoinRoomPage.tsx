import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[#050816] p-6 flex flex-col justify-center">
      <div className="absolute inset-0">
  <div className="absolute top-[-200px] left-[-120px] h-[420px] w-[420px] rounded-full bg-[#22C55E]/20 blur-[140px]" />

  <div className="absolute bottom-[-150px] right-[-120px] h-[350px] w-[350px] rounded-full bg-emerald-400/10 blur-[140px]" />

  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
</div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md mx-auto space-y-6"
      >
        <Link
          to="/rooms"
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Back to rooms
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Join Room</h1>
            <p className="text-sm text-zinc-400 mt-1.5 font-medium">
              Enter the invite code shared by your roommate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Invite Code"
              placeholder="e.g. K3LIF1GQ"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="uppercase tracking-[0.3em] text-center text-xl font-black border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:border-[#22C55E] focus-visible:ring-[#22C55E]"
            />

            {joinMutation.isError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-600">
                Invalid invite code. Please check and try again.
              </div>
            )}

            <Button
              type="submit"
              loading={joinMutation.isPending}
              className="h-14 w-full rounded-2xl bg-[#22C55E] text-base font-bold hover:bg-[#16A34A]"
            >
              Join Room
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
