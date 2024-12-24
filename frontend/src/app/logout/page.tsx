"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../ui/Navbar";

const Page = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [login, setLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // logging out
      const res = await fetch("http://localhost:8080/logout");
      if (res.ok) {
        localStorage.removeItem("username");
        console.log(res.json().message);
        setMessage("Logged out successfully!");
        setLogin(false);
      } else {
        setMessage("Problem occured in logout....");
      }
    } catch (e) {
      console.log(e);
      setMessage("Problem occured in logout....");
    }
  };

  useEffect(() => {
    if (!login) router.push("/");
  }, [login, router]);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  return (
    <>
      <Navbar username={login ? username : ""} />
      <div className="flex flex-col justify-center items-center mx-auto mt-32">
        <h1 className="text-7xl mb-8">Hello, {username}</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center mx-auto"
        >
          <button className="mt-2 border rounded-md p-2" type="submit">
            Logout
          </button>
        </form>
        {message && message[0] == "L" ? (
          <p className="mt-2 text-green-200">{message}</p>
        ) : (
          <p className="mt-2 text-red-200">{message}</p>
        )}
      </div>
    </>
  );
};

export default Page;
