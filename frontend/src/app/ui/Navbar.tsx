"use client";
import React from "react";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import Link from "next/link";

const Navlinks = () => {
  return (
    <div className="md:space-x-16 flex md:flex-row md:space-y-0 flex-col space-y-4">
      <Link href="/">Home</Link>
      <Link href="/diary">Diary</Link>
      <Link href="/game">Game</Link>
      <Link href="/dict">Dictionary</Link>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="top-0 bg-black flex-wrap z-[20] mx-auto flex w-2/3 items-center justify-between border-b border-purple p-8">
      <nav className="w-full">
        <div className="hidden w-full md:flex space-x-32 justify-center mx-auto">
          <Navlinks />
        </div>
        <div className="md:hidden">
          <button onClick={toggleNavbar}>
            {isOpen ? <X></X> : <Menu></Menu>}
          </button>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden flex flex-col items-center basis-full">
          <Navlinks />
        </div>
      )}
    </header>
  );
};

export default Navbar;
