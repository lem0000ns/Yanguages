"use client";

import React, { useState } from "react";
import Navbar from "../ui/Navbar";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [message, setMessage] = useState("");
  const [visibleOne, setVisibleOne] = useState(false);
  const [visibleTwo, setVisibleTwo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Username entered: ${username}`);
    console.log(`Password entered: ${password}`);
    console.log(`Confirmed Password entered: ${confirmPw}`);
    if (confirmPw != password) setMessage("Passwords don't match");
    else {
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
    }
  };

  return (
    <>
      <Navbar username={""} />
      <div className="flex flex-col justify-center items-center mt-32 ">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
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
            <div className="flex items-center justify-between">
              <input
                type={visibleOne ? "text" : "password"}
                className="text-black w-[25vh]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p
                className="text-x1 cursor-pointer"
                onClick={() => setVisibleOne(!visibleOne)}
              >
                {visibleOne ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </p>
            </div>
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
