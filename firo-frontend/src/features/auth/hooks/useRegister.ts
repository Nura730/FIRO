import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { register as registerApi } from "../../../api/auth.api";
import type { RegisterPayload } from "../../../types/auth";

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      registerApi(payload),

    onSuccess: () => {
      navigate("/login");
    },
  });
}