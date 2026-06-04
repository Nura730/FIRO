import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Receipt, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900" />
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-7 relative">
          {/* Animated Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="text-center space-y-4"
          >
            {/* Custom glowing coin logo */}
            <div className="relative mx-auto flex h-18 w-18 items-center justify-center">
              {/* Outer spin ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-indigo-500 opacity-50 blur-[2px] animate-spin" style={{ animationDuration: '12s' }} />
              {/* Core coin */}
              <div className="absolute inset-1 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.45)] relative z-10">
                <Receipt size={24} className="stroke-[2.25]" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-450">
                FIRO Room Ledger
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white font-heading">
                Split Smarter.
              </h1>
              <p className="text-xs font-semibold text-slate-405 max-w-[260px] mx-auto leading-relaxed">
                Manage roommate bills, track net balances, and settle payments without manual math.
              </p>
            </div>
          </motion.div>

          {/* Animated Form Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.05 }}
            className="glass-panel rounded-[32px] p-7 border border-white/12 bg-white/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]"
          >
            <div className="mb-5.5 space-y-0.5">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Welcome Back 👋
              </h2>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                Enter your credentials to manage your shared spaces.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="alex@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startIcon={<Mail className="w-4 h-4 text-emerald-400" />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startIcon={<Lock className="w-4 h-4 text-emerald-400" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                required
              />

              {loginMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs font-semibold text-rose-300"
                >
                  Incorrect email or password. Please try again.
                </motion.div>
              )}

              <Button
                type="submit"
                loading={loginMutation.isPending}
                className="h-13 w-full rounded-2xl text-sm font-bold mt-2"
              >
                <span>Sign In</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            {/* Create Account redirect */}
            <div className="mt-5 border-t border-white/[0.06] pt-4.5 text-center">
              <p className="text-xs font-semibold text-slate-400">
                New to FIRO?{" "}
                <Link
                  to="/register"
                  className="font-bold text-emerald-400 hover:text-emerald-350 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-slate-550 pt-2"
          >
            FIRO • Premium Expense Management
          </motion.p>
        </div>
      </div>
    </div>
  );
}