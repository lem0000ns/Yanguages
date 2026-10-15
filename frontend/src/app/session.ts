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
  /** False when the API is too old to expose word-bank admin (missing field). */
  wordCatalogAdminEnabled: boolean;
};

export async function fetchSession(): Promise<SessionInfo> {
  const res = await apiFetch("/me");
  if (!res.ok) {
    return {
      username: "",
      canEditWords: false,
      wordCatalogAdminEnabled: false,
    };
  }
  const data = await res.json();
  const wordCatalogAdminEnabled = data.wordCatalogAdminEnabled === true;
  let canEditWords = Boolean(data.canEditWords);
  if (wordCatalogAdminEnabled && !canEditWords && data.username) {
    const probe = await apiFetch("/admin/words?page=1&limit=1");
    if (probe.ok) canEditWords = true;
  }
  return {
    username: typeof data.username === "string" ? data.username : "",
    canEditWords,
    wordCatalogAdminEnabled,
  };
}
