import type { LoginPayload, registerPayload } from "@/types/auth";

export const loginRequest = async (payload: LoginPayload) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return res.json();
};

export const registerRequest = async (payload: registerPayload) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return res.json();
};
