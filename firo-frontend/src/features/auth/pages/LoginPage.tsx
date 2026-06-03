import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    loginMutation.mutate({
      email,
      password,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-green-500">
              FIRO
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage roommate expenses easily
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {loginMutation.isError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                Login failed. Please check your credentials.
              </div>
            )}

            <Button
              type="submit"
              loading={loginMutation.isPending}
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-500 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}