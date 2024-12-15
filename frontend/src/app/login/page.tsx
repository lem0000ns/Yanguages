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
            Login
          </button>
        </form>
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

export default page;
