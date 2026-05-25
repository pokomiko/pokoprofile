"use client";

import type { ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDraggableWindow, type WindowBounds } from "@/hooks/useDraggableWindow";
import { cx } from "@/lib/cx";

export type PokoWindowHandle = {
  restore: (focus?: () => void) => void;
};

type PokoWindowProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  subtitle?: string;
  icon: string;
  zIndex: number;
  active?: boolean;
  initialBounds?: Partial<WindowBounds>;
  actions?: ReactNode;
  children: ReactNode;
  onFocus: () => void;
};

export const PokoWindow = forwardRef<PokoWindowHandle, PokoWindowProps>(function PokoWindow({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  zIndex,
  active = false,
  initialBounds,
  actions,
  children,
  onFocus
}, ref) {
  const {
    windowRef,
    visible,
    setVisible,
    isMaximized,
    isDragging,
    isResizing,
    animationState,
    style,
    syncElementSize,
    toggleMaximize,
    minimize,
    close,
    restore,
    startDragging,
    startResizing
  } = useDraggableWindow({
    initialBounds,
    maximizedTop: 58,
    minTop: 72,
    viewportPadding: 14
  });
  const minimizedRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  const [maximizePulse, setMaximizePulse] = useState(false);
  const maximizePulseTimerRef = useRef<number | undefined>(undefined);

  const restoreWindow = useCallback((focus?: () => void) => {
    minimizedRef.current = false;
    restore(focus);
  }, [restore]);

  useImperativeHandle(ref, () => ({
    restore: restoreWindow
  }), [restoreWindow]);

  useEffect(() => {
    if (open) {
      restoreWindow();
      return;
    }

    minimizedRef.current = false;
    setVisible(false);
  }, [open, restoreWindow, setVisible]);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (visible) {
      onOpenChangeRef.current(true);
      return;
    }

    if (!minimizedRef.current) {
      onOpenChangeRef.current(false);
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (maximizePulseTimerRef.current) {
        window.clearTimeout(maximizePulseTimerRef.current);
      }
    };
  }, []);

  function focusWindow() {
    syncElementSize();
    onFocus();
  }

  function minimizeWindow() {
    minimizedRef.current = true;
    minimize();
  }

  function closeWindow() {
    minimizedRef.current = false;
    close();
  }

  function triggerMaximizePulse() {
    if (maximizePulseTimerRef.current) {
      window.clearTimeout(maximizePulseTimerRef.current);
    }

    setMaximizePulse(false);
    window.requestAnimationFrame(() => setMaximizePulse(true));
    maximizePulseTimerRef.current = window.setTimeout(() => {
      setMaximizePulse(false);
      maximizePulseTimerRef.current = undefined;
    }, 420);
  }

  function handleMaximizeRequest() {
    triggerMaximizePulse();
    toggleMaximize();
  }

  if (!visible) {
    return null;
  }

  return (
    <section
      ref={windowRef}
      className={cx(
        "poko-window absolute flex min-h-[240px] min-w-[320px] flex-col overflow-hidden rounded-[22px] border shadow-[0_28px_100px_rgba(0,0,0,0.42)]",
        active && "active",
        isMaximized && "maximized",
        isDragging && "dragging",
        isResizing && "resizing",
        animationState === "minimizing" && "minimizing",
        animationState === "closing" && "closing",
        animationState === "maximizing" && "maximizing",
        animationState === "restoring" && "restoring"
      )}
      style={{ ...style, zIndex }}
      onPointerDown={focusWindow}
    >
      <header
        className="window-titlebar flex h-11 touch-none cursor-move items-center justify-between gap-4 border-b px-4"
        onPointerDown={startDragging}
        onDoubleClick={toggleMaximize}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-2">
            <button className="traffic traffic-close" type="button" aria-label="Close window" title="Close" onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); closeWindow(); }} />
            <button className="traffic traffic-minimize" type="button" aria-label="Minimize window" title="Minimize" onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); minimizeWindow(); }} />
            <button
              className={cx("traffic traffic-maximize", maximizePulse && "traffic-pulse")}
              type="button"
              aria-label="Maximize window"
              title="Maximize"
              onPointerDown={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                handleMaximizeRequest();
              }}
            />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="app-icon">{icon}</span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{title}</h2>
              {subtitle ? <p className="truncate text-[0.68rem] text-current/55">{subtitle}</p> : null}
            </div>
          </div>
        </div>

        {actions}
      </header>

      <div className="window-content min-h-0 flex-1 overflow-hidden">{children}</div>

      <button className="resize-handle" type="button" aria-label="Resize window" title="Resize" onPointerDown={startResizing} />
    </section>
  );
});
