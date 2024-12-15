import React from "react";
import Navbar from "../ui/Navbar";

const page = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mx-auto mt-32">
        <form
          action="/register"
          method="POST"
          className="flex flex-col items-center mx-auto"
        >
          <div className="flex flex-col">
            <label htmlFor="usrname">Username</label>{" "}
            <input type="text" id="usrname" name="usrname" required></input>
          </div>
          <div className="flex flex-col">
            <label htmlFor="email">Email</label>{" "}
            <input type="email" id="email" name="email" required></input>
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password</label>{" "}
            <input
              type="password"
              id="password"
              name="password"
              required
            ></input>
          </div>
          <button className="mt-2" type="submit">
            Register
          </button>
        </form>
      </div>
    </>
  );
};

export default page;
