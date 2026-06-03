import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useCreateRoom } from "../hooks/useCreateRoom";

export default function CreateRoomPage() {
  const [name, setName] = useState("");
  const createMutation = useCreateRoom();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(name.trim());
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 max-w-md mx-auto w-full flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full space-y-6"
      >
        <Link
          to="/rooms"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Back to rooms
        </Link>

        <div className="bg-white rounded-[24px] border border-[#E2E8F0]/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Create Room</h1>
            <p className="text-sm text-[#64748B] mt-1.5 font-medium">
              Start a new shared expense ledger with roommates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Room Name"
              placeholder="e.g. Apartment 4B, Sweet Home"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-[#E2E8F0] focus:border-[#22C55E]"
            />

            {createMutation.isError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-600">
                Failed to create room. Please try again.
              </div>
            )}

            <Button
              type="submit"
              loading={createMutation.isPending}
              className="rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold h-12 transition-all"
            >
              Create Room
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
