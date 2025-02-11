"use client";
import React from "react";
import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserIcon from "../ui/UserIcon";

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
    <div className="logout-dropdown-container absolute min-w-max">
      <ul className="logout-dropdown flex">
        <li onClick={handleLogOut}>Log out</li>
      </ul>
    </div>
  );
};

const Navlinks = () => {
  return (
    <div className="md:space-x-16 flex md:flex-row md:space-y-0 flex-col space-y-4 items-center">
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
    <header className="top-0 bg-violet-950/50 flex-wrap z-[20] mx-auto flex w-full items-center justify-between p-8">
      <nav className="w-full">
        <div className="hidden w-5/6 md:flex space-x-32 justify-between items-center mx-auto">
          <Link href="/">Yanguages</Link>
          <Navlinks />
          {username ? (
            <div className="flex flex-row items-center space-x-2">
              <UserIcon />
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
          <Link href="/">Yanguages</Link>
          <Navlinks />
          {username ? (
            <div className="flex flex-row space-x-2 items-center">
              <UserIcon />
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
