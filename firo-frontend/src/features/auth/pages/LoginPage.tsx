import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Receipt, ArrowRight } from "lucide-react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
              Split Smarter.
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Manage roommate expenses, balances and settlements
              without spreadsheets.
            </p>
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
                Welcome Back 👋
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Sign in to continue managing your shared expenses.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-13 border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:border-[#22C55E] focus-visible:ring-[#22C55E]"
              />

              {loginMutation.isError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  Invalid email or password.
                </div>
              )}

              <Button
                type="submit"
                loading={loginMutation.isPending}
                className="h-14 w-full rounded-2xl bg-[#22C55E] text-base font-bold hover:bg-[#16A34A]"
              >
                <span>Sign In</span>
                <ArrowRight size={18} />
              </Button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-zinc-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#22C55E] transition hover:text-[#4ADE80]"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
              FIRO • Room Expense Manager
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}