"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BootScreen } from "@/components/BootScreen";
import { GalleryApp } from "@/components/GalleryApp";
import { MonitorApp } from "@/components/MonitorApp";
import { PokoTopBar } from "@/components/PokoTopBar";
import { PortfolioTerminal } from "@/components/PortfolioTerminal";
import type { PokoWindowHandle } from "@/components/PokoWindow";
import type { AppId } from "@/lib/types";
import { cx } from "@/lib/cx";

export function PokoDesktop() {
  const [booting, setBooting] = useState(true);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [activeApp, setActiveApp] = useState<AppId>("monitor");
  const [openApps, setOpenApps] = useState<Record<AppId, boolean>>({
    terminal: true,
    gallery: true,
    monitor: true
  });
  const [zIndex, setZIndex] = useState<Record<AppId, number>>({
    terminal: 1002,
    gallery: 1001,
    monitor: 1003
  });
  const zCounterRef = useRef(1010);
  const terminalRef = useRef<PokoWindowHandle | null>(null);
  const galleryRef = useRef<PokoWindowHandle | null>(null);
  const monitorRef = useRef<PokoWindowHandle | null>(null);

  const focusApp = useCallback((app: AppId, force = false) => {
    setActiveApp((current) => {
      if (!force && current === app) {
        return current;
      }

      zCounterRef.current += 1;
      setZIndex((values) => ({ ...values, [app]: zCounterRef.current }));
      return app;
    });
  }, []);

  const setAppOpen = useCallback((app: AppId, value: boolean) => {
    setOpenApps((apps) => {
      if (apps[app] === value) {
        return apps;
      }

      return { ...apps, [app]: value };
    });
  }, []);

  const launchApp = useCallback((app: AppId) => {
    setAppOpen(app, true);
    focusApp(app, true);
    window.requestAnimationFrame(() => {
      const refs: Record<AppId, React.RefObject<PokoWindowHandle | null>> = {
        terminal: terminalRef,
        gallery: galleryRef,
        monitor: monitorRef
      };

      refs[app].current?.restore();
    });
  }, [focusApp, setAppOpen]);

  function applyTheme(mode: "dark" | "light") {
    setThemeMode(mode);
    document.documentElement.dataset.theme = mode;
  }

  function toggleTheme() {
    applyTheme(themeMode === "dark" ? "light" : "dark");
  }

  useEffect(() => {
    applyTheme(themeMode);

    function handleThemeEvent(event: Event) {
      const detail = (event as CustomEvent<{ mode?: "dark" | "light" }>).detail;

      if (detail?.mode) {
        applyTheme(detail.mode);
      }
    }

    window.addEventListener("poko:set-theme", handleThemeEvent);

    if (window.matchMedia("(max-width: 760px)").matches) {
      setOpenApps((values) => ({ ...values, gallery: false, monitor: true }));
      focusApp("monitor", true);
    }

    const bootTimer = window.setTimeout(() => setBooting(false), 2350);

    return () => {
      window.removeEventListener("poko:set-theme", handleThemeEvent);
      window.clearTimeout(bootTimer);
    };
  // Intentionally run once after hydration for OS boot/setup.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className={cx(
        "poko-os relative min-h-screen overflow-hidden bg-[url('/images/bg.webp')] bg-cover bg-center bg-fixed font-mono",
        themeMode === "dark" ? "theme-dark" : "theme-light"
      )}
    >
      <PokoTopBar
        activeApp={activeApp}
        openApps={openApps}
        themeMode={themeMode}
        onLaunch={launchApp}
        onToggleTheme={toggleTheme}
      />

      <img
        className="desktop-logo absolute bottom-8 right-8 z-[20] h-auto w-[18vw] min-w-[120px] max-w-[360px]"
        src="/images/poko-logo.webp"
        alt="Poko logo"
      />

      <PortfolioTerminal
        ref={terminalRef}
        open={openApps.terminal}
        onOpenChange={(value) => setAppOpen("terminal", value)}
        active={activeApp === "terminal"}
        zIndex={zIndex.terminal}
        onFocus={() => focusApp("terminal")}
      />

      <GalleryApp
        ref={galleryRef}
        open={openApps.gallery}
        onOpenChange={(value) => setAppOpen("gallery", value)}
        active={activeApp === "gallery"}
        zIndex={zIndex.gallery}
        onFocus={() => focusApp("gallery")}
      />

      <MonitorApp
        ref={monitorRef}
        open={openApps.monitor}
        onOpenChange={(value) => setAppOpen("monitor", value)}
        active={activeApp === "monitor"}
        zIndex={zIndex.monitor}
        onFocus={() => focusApp("monitor")}
      />

      <div className={cx("boot-transition", booting ? "boot-visible" : "boot-hidden")}>
        {booting ? <BootScreen /> : null}
      </div>
    </main>
  );
}
