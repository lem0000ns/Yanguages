import { API_URL } from "./config";

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
  });
}

export async function fetchSession() {
  const res = await apiFetch("/me");
  if (!res.ok) return "";
  const data = await res.json();
  return typeof data.username === "string" ? data.username : "";
}
