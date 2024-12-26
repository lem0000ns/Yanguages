"use client";

import React, { useState, useEffect } from "react";

const AddDict = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  return <button className="mt-16">HI</button>;
};

export default AddDict;
