"use client";

import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Navbar from "../ui/Navbar";

const Page = () => {
  const [username, setUsername] = useState("");
  const [login, setLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // logging in
      const res = await fetch(
        "https://yanguages-production.up.railway.app/login",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();
      setMessage(data.message);
      localStorage.setItem("username", username);
      setLogin(true);
    } catch (e) {
      console.log(e);
      setMessage("Incorrect username or password");
      localStorage.removeItem("username");
      setLogin(false);
    }
  };

  return (
    <>
      <Navbar username={login ? username : ""} />
      <div className="flex flex-col justify-center items-center mx-auto mt-32">
        <form onSubmit={handleSubmit} className="flex flex-col items-cente">
          <div className="flex flex-col">
            <label>Username</label>{" "}
            <input
              type="text"
              value={username}
              className="text-black w-[25vh]"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label>Password</label>{" "}
            <div className="flex flex-row space-x-2 relative w-full">
              <input
                type={visible ? "text" : "password"}
                className="text-black w-[25vh]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p
                className="text-x1 cursor-pointer"
                onClick={() => setVisible(!visible)}
              >
                {visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </p>
            </div>
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
        {!login && (
          <div className="mt-16 flex flex-col items-center space-y-4">
            <p>No account?</p>
            <a className="border rounded-md p-2" href="/register">
              Register
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
