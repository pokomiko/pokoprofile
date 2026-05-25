"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WindowAnimation = "" | "minimizing" | "closing" | "maximizing" | "restoring";

export type WindowBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type DraggableWindowOptions = {
  initialBounds?: Partial<WindowBounds>;
  maximizedTop?: number;
  minTop?: number;
  viewportPadding?: number;
};

const animationDuration = 260;
const maximizeAnimationDuration = 340;
const minWidth = 320;
const minHeight = 240;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function useDraggableWindow(options: DraggableWindowOptions = {}) {
  const initialBounds = useMemo<WindowBounds>(() => ({
    top: options.initialBounds?.top ?? 96,
    left: options.initialBounds?.left ?? 56,
    width: options.initialBounds?.width ?? 760,
    height: options.initialBounds?.height ?? 520
  }), [options.initialBounds?.height, options.initialBounds?.left, options.initialBounds?.top, options.initialBounds?.width]);
  const maximizedTop = options.maximizedTop ?? 58;
  const minTop = options.minTop ?? 72;
  const viewportPadding = options.viewportPadding ?? 12;
  const windowRef = useRef<HTMLElement | null>(null);
  const savedBoundsRef = useRef<WindowBounds>(initialBounds);
  const boundsRef = useRef<WindowBounds>(initialBounds);
  const dragStateRef = useRef({ active: false, pointerId: 0, offsetX: 0, offsetY: 0, width: 0, height: 0 });
  const resizeStateRef = useRef({ active: false, pointerId: 0, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const hideTimerRef = useRef<number | undefined>(undefined);
  const temporaryAnimationTimerRef = useRef<number | undefined>(undefined);
  const resizeEndTimerRef = useRef<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [animationState, setAnimationState] = useState<WindowAnimation>("");
  const [bounds, setBounds] = useState<WindowBounds>(initialBounds);

  const updateBounds = useCallback((updater: (current: WindowBounds) => WindowBounds) => {
    setBounds((current) => {
      const next = updater(current);
      boundsRef.current = next;
      return next;
    });
  }, []);

  const clampBounds = useCallback((current: WindowBounds) => {
    if (typeof window === "undefined") {
      return current;
    }

    const maxWidth = Math.max(minWidth, window.innerWidth - viewportPadding * 2);
    const maxHeight = Math.max(minHeight, window.innerHeight - minTop - viewportPadding);
    const width = clamp(current.width, minWidth, maxWidth);
    const height = clamp(current.height, minHeight, maxHeight);
    const maxLeft = window.innerWidth - Math.min(width, window.innerWidth) - viewportPadding;
    const maxTop = window.innerHeight - Math.min(height, window.innerHeight) - viewportPadding;

    return {
      width,
      height,
      left: clamp(current.left, viewportPadding, maxLeft),
      top: clamp(current.top, minTop, maxTop)
    };
  }, [minTop, viewportPadding]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
    }
  }, []);

  const clearTemporaryAnimationTimer = useCallback(() => {
    if (temporaryAnimationTimerRef.current) {
      window.clearTimeout(temporaryAnimationTimerRef.current);
      temporaryAnimationTimerRef.current = undefined;
    }
  }, []);

  const clearResizeTimer = useCallback(() => {
    if (resizeEndTimerRef.current) {
      window.clearTimeout(resizeEndTimerRef.current);
      resizeEndTimerRef.current = undefined;
    }
  }, []);

  const setTemporaryAnimation = useCallback((state: "maximizing" | "restoring") => {
    clearTemporaryAnimationTimer();
    setAnimationState(state);
    temporaryAnimationTimerRef.current = window.setTimeout(() => {
      setAnimationState("");
      temporaryAnimationTimerRef.current = undefined;
    }, maximizeAnimationDuration);
  }, [clearTemporaryAnimationTimer]);

  const syncElementSize = useCallback(() => {
    if (isMaximized || !visible || !windowRef.current) {
      return;
    }

    const rect = windowRef.current.getBoundingClientRect();
    const next = clampBounds({
      ...boundsRef.current,
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });
    const changed = Math.abs(next.width - boundsRef.current.width) > 1 || Math.abs(next.height - boundsRef.current.height) > 1;

    if (!changed) {
      return;
    }

    setIsResizing(true);
    boundsRef.current = next;
    setBounds(next);
    clearResizeTimer();
    resizeEndTimerRef.current = window.setTimeout(() => setIsResizing(false), 160);
  }, [clampBounds, clearResizeTimer, isMaximized, visible]);

  const captureBounds = useCallback(() => {
    const rect = windowRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    savedBoundsRef.current = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }, []);

  const toggleMaximize = useCallback(() => {
    clearHideTimer();

    if (!isMaximized) {
      captureBounds();
      setTemporaryAnimation("maximizing");
      setIsMaximized(true);
      return;
    }

    const restored = clampBounds(savedBoundsRef.current);
    boundsRef.current = restored;
    setBounds(restored);
    setTemporaryAnimation("restoring");
    setIsMaximized(false);
  }, [captureBounds, clampBounds, clearHideTimer, isMaximized, setTemporaryAnimation]);

  const hideWithAnimation = useCallback((state: "minimizing" | "closing") => {
    clearHideTimer();
    clearTemporaryAnimationTimer();
    setAnimationState(state);
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setAnimationState("");
    }, animationDuration);
  }, [clearHideTimer, clearTemporaryAnimationTimer]);

  const minimize = useCallback(() => hideWithAnimation("minimizing"), [hideWithAnimation]);
  const close = useCallback(() => hideWithAnimation("closing"), [hideWithAnimation]);

  const restore = useCallback((focus?: () => void) => {
    clearHideTimer();
    clearTemporaryAnimationTimer();
    setAnimationState("");
    setVisible(true);
    window.requestAnimationFrame(() => {
      if (!isMaximized) {
        updateBounds(clampBounds);
      }

      focus?.();
    });
  }, [clampBounds, clearHideTimer, clearTemporaryAnimationTimer, isMaximized, updateBounds]);

  const stopDragging = useCallback(() => {
    const state = dragStateRef.current;

    if (state.active) {
      try {
        windowRef.current?.releasePointerCapture(state.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    dragStateRef.current.active = false;
    setIsDragging(false);
    window.removeEventListener("pointermove", handleDragging);
    window.removeEventListener("pointerup", stopDragging);
  }, []);

  const stopResizing = useCallback(() => {
    const state = resizeStateRef.current;

    if (state.active) {
      try {
        windowRef.current?.releasePointerCapture(state.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    resizeStateRef.current.active = false;
    setIsResizing(false);
    window.removeEventListener("pointermove", handleManualResize);
    window.removeEventListener("pointerup", stopResizing);
  }, []);

  const handleDragging = useCallback((event: PointerEvent) => {
    const state = dragStateRef.current;

    if (!state.active || event.pointerId !== state.pointerId) {
      return;
    }

    updateBounds((current) => ({
      ...current,
      left: clamp(
        event.clientX - state.offsetX,
        viewportPadding,
        window.innerWidth - Math.min(state.width, window.innerWidth) - viewportPadding
      ),
      top: clamp(
        event.clientY - state.offsetY,
        minTop,
        window.innerHeight - Math.min(state.height, window.innerHeight) - viewportPadding
      )
    }));
  }, [minTop, updateBounds, viewportPadding]);

  const handleManualResize = useCallback((event: PointerEvent) => {
    const state = resizeStateRef.current;

    if (!state.active || event.pointerId !== state.pointerId) {
      return;
    }

    updateBounds((current) => {
      const maxWidth = Math.max(minWidth, window.innerWidth - current.left - viewportPadding);
      const maxHeight = Math.max(minHeight, window.innerHeight - current.top - viewportPadding);

      return {
        ...current,
        width: clamp(state.startWidth + event.clientX - state.startX, minWidth, maxWidth),
        height: clamp(state.startHeight + event.clientY - state.startY, minHeight, maxHeight)
      };
    });
  }, [updateBounds, viewportPadding]);

  const startDragging = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (isMaximized || event.button !== 0) {
      return;
    }

    syncElementSize();
    const rect = windowRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    event.preventDefault();
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };
    setIsDragging(true);
    windowRef.current?.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", handleDragging);
    window.addEventListener("pointerup", stopDragging);
  }, [handleDragging, isMaximized, stopDragging, syncElementSize]);

  const startResizing = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (isMaximized || event.button !== 0) {
      return;
    }

    event.preventDefault();
    clearResizeTimer();
    resizeStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: boundsRef.current.width,
      startHeight: boundsRef.current.height
    };
    setIsResizing(true);
    windowRef.current?.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", handleManualResize);
    window.addEventListener("pointerup", stopResizing);
  }, [clearResizeTimer, handleManualResize, isMaximized, stopResizing]);

  useEffect(() => {
    function handleResize() {
      if (!isMaximized) {
        updateBounds(clampBounds);
      }
    }

    window.addEventListener("resize", handleResize);
    updateBounds(clampBounds);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [clampBounds, isMaximized, updateBounds]);

  useEffect(() => {
    return () => {
      clearHideTimer();
      clearTemporaryAnimationTimer();
      clearResizeTimer();
      window.removeEventListener("pointermove", handleDragging);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointermove", handleManualResize);
      window.removeEventListener("pointerup", stopResizing);
    };
  }, [clearHideTimer, clearResizeTimer, clearTemporaryAnimationTimer, handleDragging, handleManualResize, stopDragging, stopResizing]);

  const style = useMemo<CSSProperties>(() => {
    if (isMaximized) {
      return {
        top: `${maximizedTop}px`,
        left: 0,
        width: "100vw",
        height: `calc(100dvh - ${maximizedTop + viewportPadding}px)`
      };
    }

    return {
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`
    };
  }, [bounds.height, bounds.left, bounds.top, bounds.width, isMaximized, maximizedTop, viewportPadding]);

  return {
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
  };
}
