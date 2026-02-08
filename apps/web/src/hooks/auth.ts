import { loginRequest, registerRequest } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login({
        user: data.user,
        accessToken: data.accessToken,
      });
      navigate("/dashboard");
    },
  });
};

export const useRegister = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login({
        user: data.user,
        accessToken: data.accessToken,
      });
      navigate("/dashboard");
    },
  });
};
