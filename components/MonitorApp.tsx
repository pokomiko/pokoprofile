"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { PokoWindow, type PokoWindowHandle } from "@/components/PokoWindow";
import { useClientMetrics } from "@/hooks/useClientMetrics";

type MonitorAppProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  zIndex: number;
  active: boolean;
  onFocus: () => void;
};

export const MonitorApp = forwardRef<PokoWindowHandle, MonitorAppProps>(function MonitorApp({
  open,
  onOpenChange,
  zIndex,
  active,
  onFocus
}, ref) {
  const windowRef = useRef<PokoWindowHandle | null>(null);
  const { cpuLoad, cores, uptime, memoryPercent, memoryLabel, memoryHint, processes } = useClientMetrics();

  useImperativeHandle(ref, () => ({
    restore: (focus?: () => void) => windowRef.current?.restore(focus)
  }), []);

  return (
    <PokoWindow
      ref={windowRef}
      open={open}
      onOpenChange={onOpenChange}
      title="System Monitor"
      subtitle="page CPU and JS heap metrics"
      icon="MON"
      zIndex={zIndex}
      active={active}
      initialBounds={{ top: 648, left: 632, width: 592, height: 360 }}
      onFocus={onFocus}
    >
      <div className="h-full overflow-y-auto p-4">
        <div className="monitor-stats-grid mb-4 grid grid-cols-2 gap-3">
          <div className="monitor-card">
            <div className="label">Page CPU</div>
            <div className="value">{cpuLoad}%</div>
            <div className="bar"><span style={{ width: `${cpuLoad}%` }} /></div>
            <div className="hint">main-thread load, {cores} logical cores</div>
          </div>

          <div className="monitor-card">
            <div className="label">Page RAM</div>
            <div className="value">{memoryLabel}</div>
            <div className="bar"><span style={{ width: `${memoryPercent}%` }} /></div>
            <div className="hint">{memoryHint}</div>
          </div>
        </div>

        <div className="monitor-card">
          <div className="mb-2 flex items-center justify-between">
            <span className="label">process list</span>
            <span className="text-xs text-current/55">uptime {uptime}s</span>
          </div>
          <div className="process-row header">
            <span>PID</span>
            <span>APP</span>
            <span>CPU</span>
            <span>MEM</span>
          </div>
          {processes.map((process) => (
            <div key={process.pid} className="process-row">
              <span>{process.pid}</span>
              <span>{process.name}</span>
              <span>{process.cpu}%</span>
              <span>{process.mem}MB</span>
            </div>
          ))}
        </div>
      </div>
    </PokoWindow>
  );
});
