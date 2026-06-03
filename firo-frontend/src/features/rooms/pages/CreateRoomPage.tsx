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
    <div className="h-full overflow-y-auto bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-lg mx-auto"
      >
        <Link
          to="/rooms"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to rooms
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Create a Room</h1>
            <p className="text-sm text-slate-500 mt-1">
              Start a new shared expense room
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Room Name"
              placeholder="e.g. Apartment 4B"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {createMutation.isError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                Failed to create room. Please try again.
              </div>
            )}

            <Button type="submit" loading={createMutation.isPending}>
              Create Room
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
