"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MemoryApi = Performance & {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

export function useClientMetrics() {
  const [cpuLoad, setCpuLoad] = useState(8);
  const [memoryPercent, setMemoryPercent] = useState(0);
  const [memoryLabel, setMemoryLabel] = useState("sampling");
  const [memoryHint, setMemoryHint] = useState("page metrics");
  const [cores, setCores] = useState(1);
  const [uptime, setUptime] = useState(0);
  const startedAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const longTaskBudgetRef = useRef(0);

  useEffect(() => {
    let observer: PerformanceObserver | undefined;

    function updateMemory() {
      const performanceMemory = (performance as MemoryApi).memory;

      if (performanceMemory) {
        const used = performanceMemory.usedJSHeapSize / 1024 / 1024;
        const limit = performanceMemory.jsHeapSizeLimit / 1024 / 1024;

        setMemoryPercent(Math.min(100, Math.round((used / limit) * 100)));
        setMemoryLabel(`${Math.round(used)}MB`);
        setMemoryHint(`${Math.round(limit)}MB JS heap limit`);
        return;
      }

      setMemoryPercent(28);
      setMemoryLabel("API off");
      setMemoryHint("JS heap API unavailable");
    }

    function sample() {
      const now = performance.now();
      const delay = lastTickRef.current ? Math.max(0, now - lastTickRef.current - 1000) : 0;
      const eventLoopLoad = Math.min(65, Math.round(delay * 2.5));
      const longTaskLoad = Math.min(80, Math.round(longTaskBudgetRef.current / 12));
      const idleWave = Math.round(4 + Math.abs(Math.sin(now / 1800)) * 7);

      setCpuLoad(Math.min(100, Math.max(2, eventLoopLoad + longTaskLoad + idleWave)));
      setUptime(Math.floor((now - startedAtRef.current) / 1000));
      lastTickRef.current = now;
      longTaskBudgetRef.current = 0;
      updateMemory();
    }

    setCores(navigator.hardwareConcurrency || 1);
    startedAtRef.current = performance.now();
    lastTickRef.current = startedAtRef.current;

    if ("PerformanceObserver" in window) {
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            longTaskBudgetRef.current += entry.duration;
          }
        });
        observer.observe({ entryTypes: ["longtask"] });
      } catch {
        observer = undefined;
      }
    }

    sample();
    const timer = window.setInterval(sample, 1000);

    return () => {
      window.clearInterval(timer);
      observer?.disconnect();
    };
  }, []);

  const processes = useMemo(() => [
    { pid: 101, name: "poko-terminal", cpu: Math.max(1, Math.round(cpuLoad * 0.2)), mem: 42 },
    { pid: 202, name: "vrchat-gallery", cpu: Math.max(1, Math.round(cpuLoad * 0.16)), mem: 74 },
    { pid: 303, name: "page-monitor", cpu: Math.max(1, Math.round(cpuLoad * 0.1)), mem: Math.max(18, Math.round(memoryPercent * 0.8)) },
    { pid: 404, name: "poko-topbar", cpu: 1, mem: 14 }
  ], [cpuLoad, memoryPercent]);

  return {
    cpuLoad,
    memoryPercent,
    memoryLabel,
    memoryHint,
    cores,
    uptime,
    processes
  };
}
