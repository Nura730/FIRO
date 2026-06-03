import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Receipt } from "lucide-react";

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between px-6 py-12 max-w-md mx-auto w-full">
      {/* Top Branding / Onboarding Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-12 text-center"
      >
        <div className="mx-auto w-14 h-14 bg-[#22C55E]/10 flex items-center justify-center rounded-2xl mb-5 text-[#22C55E]">
          <Receipt size={28} />
        </div>
        <h1 className="text-[32px] font-black tracking-tight text-[#0F172A]">
          FIRO
        </h1>
        <p className="mt-2.5 text-base text-[#64748B] font-medium max-w-xs mx-auto">
          Manage roommate expenses easily. No spreadsheet required.
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full"
      >
        <div className="bg-white rounded-[24px] border border-[#E2E8F0]/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-[#0F172A]">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-[#E2E8F0] focus:border-[#22C55E]"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-[#E2E8F0] focus:border-[#22C55E]"
            />

            {loginMutation.isError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-600">
                Invalid email or password. Please try again.
              </div>
            )}

            <Button
              type="submit"
              loading={loginMutation.isPending}
              className="rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold h-12 mt-2 transition-all"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-sm text-[#64748B]">
              New to FIRO?{" "}
              <Link
                to="/register"
                className="text-[#22C55E] font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="text-center text-xs font-semibold text-[#64748B]/50 tracking-wider">
        SECURE FINANCE APP
      </div>
    </div>
  );
}