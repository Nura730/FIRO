import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Receipt, ArrowRight, Users, Wallet, PieChart } from "lucide-react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useRegister } from "../hooks/useRegister";

export default function RegisterPage() {
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-120px] h-[420px] w-[420px] rounded-full bg-[#22C55E]/20 blur-[140px]" />

        <div className="absolute bottom-[-150px] right-[-120px] h-[350px] w-[350px] rounded-full bg-emerald-400/10 blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#22C55E] shadow-[0_0_50px_rgba(34,197,94,0.4)]">
              <Receipt size={30} className="text-white" />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#22C55E]">
              FIRO
            </p>

            <h1 className="text-4xl font-black text-white">
              Create Account
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Start tracking shared expenses with roommates,
              friends and travel groups.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 grid grid-cols-3 gap-3"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <Users size={18} className="mx-auto mb-2 text-[#22C55E]" />
              <p className="text-[10px] text-zinc-400">Rooms</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <Wallet size={18} className="mx-auto mb-2 text-[#22C55E]" />
              <p className="text-[10px] text-zinc-400">Expenses</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <PieChart size={18} className="mx-auto mb-2 text-[#22C55E]" />
              <p className="text-[10px] text-zinc-400">Balances</p>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                Get Started 🚀
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Create your FIRO account in less than a minute.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-13 border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:border-[#22C55E] focus-visible:ring-[#22C55E]"
              />

              <Input
                label="Email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:border-[#22C55E] focus-visible:ring-[#22C55E]"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="h-13 border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:border-[#22C55E] focus-visible:ring-[#22C55E]"
              />

              {registerMutation.isError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  Failed to create account. Email may already exist.
                </div>
              )}

              <Button
                type="submit"
                loading={registerMutation.isPending}
                className="h-14 w-full rounded-2xl bg-[#22C55E] text-base font-bold hover:bg-[#16A34A]"
              >
                <span>Create Account</span>
                <ArrowRight size={18} />
              </Button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-zinc-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#22C55E] transition hover:text-[#4ADE80]"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>

          <div className="mt-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
              FIRO • Expense Sharing Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}