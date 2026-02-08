import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export const useBootstrapAuth = () => {
  const login = useAuthStore((s) => s.login);
  const markBootstrapped = useAuthStore((s) => s.markBootstrapped);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (data?.accessToken) {
          login({
            user: data.user,
            accessToken: data.accessToken,
          });
        }
      })
      .finally(() => {
        markBootstrapped();
      });
  }, []);
};
