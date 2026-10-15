"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchSession } from "./session";

type SessionContextValue = {
  username: string;
  canEditWords: boolean;
  wordCatalogAdminEnabled: boolean;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("");
  const [canEditWords, setCanEditWords] = useState(false);
  const [wordCatalogAdminEnabled, setWordCatalogAdminEnabled] = useState(false);

  const refreshSession = useCallback(async () => {
    const session = await fetchSession();
    setUsername(session.username);
    setCanEditWords(session.canEditWords);
    setWordCatalogAdminEnabled(session.wordCatalogAdminEnabled);
  }, []);

  const clearSession = useCallback(() => {
    setUsername("");
    setCanEditWords(false);
    setWordCatalogAdminEnabled(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <SessionContext.Provider
      value={{
        username,
        canEditWords,
        wordCatalogAdminEnabled,
        refreshSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
