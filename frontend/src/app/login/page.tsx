"use client";

import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../session";
import { useSession } from "../useSession";
import { LogIn } from "lucide-react";

const Page = () => {
  const [username, setUsername] = useState("");
  const [login, setLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { refreshSession } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/login", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setMessage("Incorrect username or password");
        setLogin(false);
        return;
      }
      const data = await res.json();
      setMessage(data.message);
      setLogin(true);
      await refreshSession();
      router.push("/dict");
    } catch (e) {
      console.log(e);
      setMessage("Incorrect username or password");
      setLogin(false);
    }
  };

  return (
    <div className="page-container flex min-h-[calc(100dvh-var(--nav-mobile-header)-var(--nav-mobile-tabs)-env(safe-area-inset-bottom))] flex-col items-center justify-center md:min-h-[calc(100dvh-2rem)]">
      <div className="card-surface w-full max-w-md animate-slide-up p-8 md:p-10">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/30 text-violet-200">
            <LogIn className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label-text" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              className="input-field"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={visible ? "text" : "password"}
                className="input-field pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-200"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>
          <button className="btn-primary mt-2 w-full" type="submit">
            Sign in
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message[0] == "S" ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        {!login && (
          <p className="mt-8 text-center text-sm text-violet-300/70">
            No account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-300 underline-offset-4 hover:text-white hover:underline"
            >
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
