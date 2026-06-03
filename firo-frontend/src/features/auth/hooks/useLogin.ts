import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { login as loginApi } from "../../../api/auth.api";
import type { LoginPayload } from "../../../types/auth";
import { useAuth } from "../../../providers/AuthProvider";

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      loginApi(payload),

    onSuccess: (response) => {
      const { token, user } = response.data;

      login(token, user);

      navigate("/rooms");
    },
  });
}