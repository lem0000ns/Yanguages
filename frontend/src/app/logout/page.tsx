"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../session";
import { useSession } from "../useSession";
import { LogOut } from "lucide-react";

const Page = () => {
  const { username } = useSession();
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/logout");
      if (res.ok) {
        localStorage.removeItem("entry");
        localStorage.removeItem("title");
        setMessage("Logged out successfully!");
      } else {
        setMessage("Problem occured in logout....");
      }
    } catch (e) {
      console.log(e);
      setMessage("Problem occured in logout....");
    }
  };

  useEffect(() => {
    if (message[0] == "L") router.push("/");
  }, [message, router]);

  return (
    <div className="page-container flex min-h-[50vh] flex-col items-center justify-center">
      <div className="card-surface w-full max-w-md p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-950/80 text-violet-200">
          <LogOut className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl font-semibold">
          Hello, {username || "friend"}
        </h1>
        <form onSubmit={handleSubmit} className="mt-8">
          <button className="btn-secondary w-full" type="submit">
            Log out
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm ${
              message[0] == "L" ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
