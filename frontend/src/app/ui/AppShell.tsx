"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Gamepad2,
  Home,
  Library,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { apiFetch } from "../session";
import { useSession } from "../useSession";

const navItems = [
  { href: "/", label: "Today", icon: Home, short: "Home" },
  { href: "/diary", label: "Diary", icon: BookOpen, short: "Diary" },
  { href: "/game", label: "Game", icon: Gamepad2, short: "Play" },
  { href: "/dict", label: "Words", icon: Library, short: "Words" },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "nav-link-active"
          : "text-violet-200/75 hover:bg-violet-950/40 hover:text-white"
      } ${compact ? "flex-col gap-1 py-2 text-[0.65rem]" : ""}`}
    >
      {active && !compact && (
        <span
          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-violet-400"
          aria-hidden
        />
      )}
      <Icon
        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          compact ? "h-5 w-5" : "h-[1.125rem] w-[1.125rem]"
        } ${active ? "text-violet-300" : "text-violet-400/80"}`}
        strokeWidth={active ? 2.25 : 2}
      />
      <span className={compact ? "leading-none" : ""}>{label}</span>
    </Link>
  );
}

function AccountPanel({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const { username, clearSession } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogOut = async () => {
    setLoggingOut(true);
    try {
      const res = await apiFetch("/logout");
      if (res.ok) {
        localStorage.removeItem("entry");
        localStorage.removeItem("title");
        clearSession();
        router.push("/login");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!username) {
    return (
      <Link href="/login" className={`btn-primary w-full ${compact ? "text-sm" : ""}`}>
        <LogIn className="h-4 w-4" />
        Sign in
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/30 text-violet-200">
          <User className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 truncate text-sm font-medium text-violet-100">
          {username}
        </span>
      </div>
      <button
        type="button"
        onClick={handleLogOut}
        disabled={loggingOut}
        className="btn-secondary w-full gap-2 text-sm"
      >
        <LogOut className="h-4 w-4" />
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { username, refreshSession } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    refreshSession();
  }, [pathname, refreshSession]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="app-shell-layout app-bg">
      <aside className="app-shell-sidebar" aria-label="Main navigation">
        <div className="border-b border-border-subtle px-5 py-6">
          <Link href="/" className="group flex items-center gap-3">
            <BrandLogo
              size={40}
              className="transition-transform group-hover:scale-105"
            />
            <p className="font-display text-xl font-semibold leading-tight tracking-tight">
              Yanguages
            </p>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-border-subtle p-4">
          <AccountPanel />
        </div>
      </aside>

      <div className="app-shell-main-wrap flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface/90 px-4 py-3 backdrop-blur-md md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={32} />
            <span className="font-display text-lg font-semibold">Yanguages</span>
          </Link>
          <div className="flex items-center gap-2">
            {username && (
              <span className="flex max-w-[8rem] items-center gap-1.5 truncate text-sm text-violet-200">
                <User className="h-4 w-4 shrink-0 text-violet-400" />
                {username}
              </span>
            )}
            <button
              type="button"
              className="rounded-lg p-2 text-violet-200 hover:bg-violet-950/50"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {mobileOpen && (
          <div className="fixed left-0 right-0 top-[var(--nav-mobile-header)] z-20 border-b border-border-subtle bg-surface-raised p-4 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 ${
                    isActive(item.href) ? "nav-link-active" : "text-violet-200/80"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-border-subtle pt-4">
              <AccountPanel compact />
            </div>
          </div>
        )}

        <main className="app-main flex-1">{children}</main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-subtle bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-lg md:hidden"
          aria-label="Mobile tab navigation"
          style={{ height: "var(--nav-mobile-tabs)" }}
        >
          <div className="mx-auto flex h-full max-w-lg items-center justify-around gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.short}
                icon={item.icon}
                active={isActive(item.href)}
                compact
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
