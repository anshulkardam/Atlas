import { useAuthStore } from "@/store/authStore";

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const refreshAccessToken = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  useAuthStore.getState().login({
    user: useAuthStore.getState().user!,
    accessToken: data.accessToken,
  });

  return data.accessToken;
};

export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { accessToken, logout } = useAuthStore.getState();

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  if (res.status !== 401) return res;

  // 🔁 ACCESS TOKEN EXPIRED
  if (!isRefreshing) {
    isRefreshing = true;

    try {
      await refreshAccessToken();
      pendingRequests.forEach((cb) => cb());
      pendingRequests = [];
      isRefreshing = false;

      return authFetch(url, options);
    } catch {
      logout();
      window.location.href = "/login";
      return Promise.reject("Session expired");
    }
  }

  // queue requests while refreshing
  return new Promise((resolve) => {
    pendingRequests.push(() => resolve(authFetch(url, options)));
  });
};
