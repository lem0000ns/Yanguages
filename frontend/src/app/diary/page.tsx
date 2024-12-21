"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";

const Diary = () => {
  const [username, setUsername] = useState(() =>
    sessionStorage.getItem("username")
  );

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"));
  }, []);

  return (
    <div>
      <Navbar username={username} />
      <div className="flex justify-center mx-auto mt-8">Work in progress</div>
    </div>
  );
};

export default Diary;
