"use client";
import React from "react";
import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LogoutDropdown = () => {
  const router = useRouter();
  const [loggedin, setLoggedin] = useState(true);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      // logging out
      const res = await fetch("http://localhost:8080/logout");
      if (res.ok) {
        localStorage.removeItem("username");
        localStorage.removeItem("entry");
        localStorage.removeItem("title");
        setLoggedin(false);
      } else {
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!loggedin) router.push("/login");
  }, [loggedin, router]);

  return (
    <div className="logout-dropdown-container left-1/2 -translate-x-1/2 absolute w-auto min-w-max">
      <ul className="logout-dropdown flex">
        <li onClick={handleLogOut}>Log out</li>
      </ul>
    </div>
  );
};

const Navlinks = () => {
  return (
    <div className="md:space-x-16 flex md:flex-row md:space-y-0 flex-col space-y-4 items-center">
      <Link href="/">Home</Link>
      <Link href="/diary">Diary</Link>
      <Link href="/game">Game</Link>
      <Link href="/dict">Dictionary</Link>
    </div>
  );
};

interface Props {
  username: string;
}

const Navbar = ({ username }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="top-0 bg-black flex-wrap z-[20] mx-auto flex w-full items-center justify-between border-b border-purple p-8">
      <nav className="w-full">
        <div className="hidden w-2/3 md:flex space-x-32 justify-between items-center mx-auto">
          <Navlinks />
          {username ? (
            <div>
              <div
                className="relative"
                onMouseEnter={() => setLogoutVisible(true)}
                onMouseLeave={() => setLogoutVisible(false)}
              >
                {username}
                {logoutVisible && <LogoutDropdown />}
              </div>
            </div>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={toggleNavbar}>
            {isOpen ? <X></X> : <Menu></Menu>}
          </button>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden flex flex-col items-center basis-full space-y-4">
          <Navlinks />
          {username ? (
            <div>
              <div
                onMouseEnter={() => setLogoutVisible(true)}
                onMouseLeave={() => setLogoutVisible(false)}
              >
                {username}
                {logoutVisible && <LogoutDropdown />}
              </div>
            </div>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
