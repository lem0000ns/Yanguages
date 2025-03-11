"use client";

import React, { useState } from "react";
import Navbar from "../ui/Navbar";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pwlen, setPwlen] = useState(0);
  const [usernameLen, setUsernameLen] = useState(0);
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
        const res = await fetch(
          "https://yanguages-production.up.railway.app/register",
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );
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

  const handlePwChange = (e) => {
    setPassword(e.target.value);
    setPwlen(e.target.value.length);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setUsernameLen(e.target.value.length);
  };

  return (
    <>
      <Navbar username={""} />
      <div className="flex flex-col justify-center items-center mt-32 ">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
          <div className="flex flex-col">
            <label>Username</label>{" "}
            <input
              type="text"
              value={username}
              className="text-black w-[25vh]"
              onChange={handleUsernameChange}
              required
            />
            <p className="text-sm text-blue-100 mt-1">
              Must be at most 12 characters
            </p>
            <p className="text-sm text-blue-100">
              Current length: {usernameLen}
            </p>
          </div>
          <div className="flex flex-col">
            <label>Password</label>{" "}
            <div className="flex items-center justify-between">
              <input
                type={visibleOne ? "text" : "password"}
                className="text-black w-[25vh]"
                value={password}
                onChange={handlePwChange}
                required
              />
              <p
                className="text-x1 cursor-pointer"
                onClick={() => setVisibleOne(!visibleOne)}
              >
                {visibleOne ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </p>
            </div>
            <p className="text-sm text-blue-100 mt-1">
              Must be at least 8 characters
            </p>
            <p className="text-sm text-blue-100">Current length: {pwlen}</p>
          </div>
          <div className="flex flex-col">
            <label>Confirm Password</label>{" "}
            <div className="flex flex-row space-x-2 relative w-full">
              <input
                type={visibleTwo ? "text" : "password"}
                className="text-black w-[25vh]"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
              <p
                className="text-x1 cursor-pointer"
                onClick={() => setVisibleTwo(!visibleTwo)}
              >
                {visibleTwo ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </p>
            </div>
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
