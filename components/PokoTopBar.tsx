"use client";

import { useEffect, useState } from "react";
import type { AppId } from "@/lib/types";
import { cx } from "@/lib/cx";

type PokoTopBarProps = {
  activeApp: AppId;
  openApps: Record<AppId, boolean>;
  themeMode: "dark" | "light";
  onLaunch: (id: AppId) => void;
  onToggleTheme: () => void;
};

const apps: Array<{ id: AppId; label: string; icon: string }> = [
  { id: "terminal", label: "Terminal", icon: ">_" },
  { id: "gallery", label: "Gallery", icon: "GAL" },
  { id: "monitor", label: "Monitor", icon: "MON" }
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/pokomiko",
    icon: "https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
  },
  {
    label: "X",
    href: "https://x.com/Poko_miko",
    short: "X"
  },
  {
    label: "VRChat",
    href: "https://vrchat.com/home/user/usr_21c3ad19-5da2-4f9b-b373-0d0d8af38c7a",
    icon: "/images/VRChat.webp"
  }
];

export function PokoTopBar({ activeApp, openApps, themeMode, onLaunch, onToggleTheme }: PokoTopBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setTime(new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(now));
      setDate(new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(now));
    }

    updateTime();
    const clockTimer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(clockTimer);
  }, []);

  return (
    <header className="topbar fixed left-0 top-0 z-[2000] flex h-14 w-full items-center justify-between gap-3 border-b px-3">
      <div className="topbar-left">
        <button className="brand-button" type="button" title="PokoOS" aria-label="PokoOS">
          <img className="h-7 w-7 object-contain" src="/images/poko-logo.webp" alt="" />
        </button>

        <nav className="app-dock" aria-label="PokoOS apps">
          {apps.map((app) => (
            <button
              key={app.id}
              className={cx("dock-icon", activeApp === app.id && "active", openApps[app.id] && "open")}
              type="button"
              title={app.label}
              aria-label={`Open ${app.label}`}
              onClick={() => onLaunch(app.id)}
            >
              <span>{app.icon}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        <div className="social-links" aria-label="Social links">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              className="social-link"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
            >
              {"icon" in link ? (
                <img className="h-4 w-4 object-contain" src={link.icon} alt={link.label} />
              ) : (
                <span>{link.short}</span>
              )}
            </a>
          ))}
        </div>

        <button
          className="theme-button"
          type="button"
          title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleTheme}
        >
          <span className={cx("theme-glyph", themeMode)} />
        </button>

        <div className="hidden text-right text-[0.68rem] leading-tight text-current/70 sm:block">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      </div>
    </header>
  );
}
