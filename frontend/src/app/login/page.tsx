"use client";

import React, { useState } from "react";
import Navbar from "../ui/Navbar";

const Page = () => {
  const [username, setUsername] = useState("");
  const [login, setLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Username entered: ${username}`);
    console.log(`Password entered: ${password}`);

    try {
      // logging in
      const res = await fetch("http://localhost:8080/login", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessage(data.message);
      sessionStorage.setItem("username", username);
      setLogin(true);
    } catch (e) {
      console.log(e);
      setMessage("Incorrect username or password");
      sessionStorage.removeItem("username");
      setLogin(false);
    }
  };

  return (
    <>
      <Navbar username={login ? username : ""} />
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
            Login
          </button>
        </form>
        {message && message[0] == "S" ? (
          <p className="mt-2 text-green-200">{message}</p>
        ) : (
          <p className="mt-2 text-red-200">{message}</p>
        )}
        <div className="mt-16 flex flex-col items-center space-y-4">
          <p>No account?</p>
          <a className="border rounded-md p-2" href="/register">
            Register
          </a>
        </div>
      </div>
    </>
  );
};

export default Page;
