"use client";

import React, { useState } from "react";
import Navbar from "../ui/Navbar";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Username entered: ${username}`);
    console.log(`Password entered: ${password}`);
    try {
      const res = await fetch("http://localhost:8080/register", {
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
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mx-auto mt-32">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center mx-auto"
        >
          <div className="flex flex-col">
            <label>Username</label>{" "}
            <input
              type="text"
              value={username}
              className="text-black"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label>Password</label>{" "}
            <input
              type="password"
              className="text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="mt-2" type="submit">
            Register
          </button>
        </form>
        {message && message[0] == "R" ? (
          <p className="mt-2 text-green-200">{message}</p>
        ) : (
          <p className="mt-2 text-red-200">{message}</p>
        )}
      </div>
    </>
  );
};

export default Page;
