import { API_URL } from "./config";

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
  });
}

export type SessionInfo = {
  username: string;
  canEditWords: boolean;
};

export async function fetchSession(): Promise<SessionInfo> {
  const res = await apiFetch("/me");
  if (!res.ok) return { username: "", canEditWords: false };
  const data = await res.json();
  return {
    username: typeof data.username === "string" ? data.username : "",
    canEditWords: Boolean(data.canEditWords),
  };
}
