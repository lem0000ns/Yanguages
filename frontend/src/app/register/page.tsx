"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiFetch } from "../session";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { UserPlus } from "lucide-react";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [message, setMessage] = useState("");
  const [visibleOne, setVisibleOne] = useState(false);
  const [visibleTwo, setVisibleTwo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmPw != password) setMessage("Passwords don't match");
    else if (password.length < 8)
      setMessage("Password must be of at least length 8");
    else if (username.length > 12)
      setMessage("Username must be at most 12 characters");
    else {
      try {
        const res = await apiFetch("/register", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          setMessage("Registration successful!");
        } else {
          setMessage("That username is already in use");
        }
      } catch (e) {
        console.log(`Error: ${e}`);
        setMessage("Problem occurred upon registration...");
      }
    }
  };

  return (
    <div className="page-container flex min-h-[calc(100dvh-var(--nav-mobile-header)-var(--nav-mobile-tabs)-env(safe-area-inset-bottom))] flex-col items-center justify-center py-12 md:min-h-[calc(100dvh-2rem)]">
      <div className="card-surface w-full max-w-md animate-slide-up p-8 md:p-10">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-200">
            <UserPlus className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-semibold">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label-text">Username</label>
            <input
              type="text"
              value={username}
              className="input-field"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <p className="mt-1.5 text-xs text-violet-400/60">
              At most 12 characters · current: {username.length}
            </p>
          </div>
          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <input
                type={visibleOne ? "text" : "password"}
                className="input-field pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-200"
                onClick={() => setVisibleOne(!visibleOne)}
                aria-label="Toggle password visibility"
              >
                {visibleOne ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-violet-400/60">
              At least 8 characters · current: {password.length}
            </p>
          </div>
          <div>
            <label className="label-text">Confirm password</label>
            <div className="relative">
              <input
                type={visibleTwo ? "text" : "password"}
                className="input-field pr-11"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-200"
                onClick={() => setVisibleTwo(!visibleTwo)}
                aria-label="Toggle confirm password visibility"
              >
                {visibleTwo ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>
          <button className="btn-primary w-full" type="submit">
            Register
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message[0] == "R" ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-violet-300/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-300 underline-offset-4 hover:text-white hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
