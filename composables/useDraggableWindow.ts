import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

type WindowAnimation = "" | "minimizing" | "closing";
type WindowBounds = {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function useDraggableWindow(options: DraggableWindowOptions = {}) {
  const windowRef = ref<HTMLElement | null>(null);
  const visible = ref(true);
  const isMaximized = ref(false);
  const isDragging = ref(false);
  const isResizing = ref(false);
  const animationState = ref<WindowAnimation>("");
  let hideTimer: ReturnType<typeof window.setTimeout> | undefined;
  let dragFrame: number | undefined;
  let resizeFrame: number | undefined;
  let manualResizeFrame: number | undefined;
  let resizeEndTimer: ReturnType<typeof window.setTimeout> | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let dragWidth = 0;
  let dragHeight = 0;
  let pendingLeft = 0;
  let pendingTop = 0;
  let pendingWidth = 0;
  let pendingHeight = 0;
  const minWidth = 320;
  const minHeight = 240;
  const maximizedTop = options.maximizedTop ?? 58;
  const minTop = options.minTop ?? 72;
  const viewportPadding = options.viewportPadding ?? 12;

  const bounds = reactive({
    top: options.initialBounds?.top ?? 96,
    left: options.initialBounds?.left ?? 56,
    width: options.initialBounds?.width ?? 760,
    height: options.initialBounds?.height ?? 520
  });

  const savedBounds = reactive({ ...bounds });
  const dragState = reactive({
    active: false,
    pointerId: 0,
    offsetX: 0,
    offsetY: 0
  });
  const resizeState = reactive({
    active: false,
    pointerId: 0,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  });

  const style = computed(() => {
    if (isMaximized.value) {
      return {
        top: `${maximizedTop}px`,
        left: "0",
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
  });

  function clearHideTimer() {
    if (!hideTimer) {
      return;
    }

    window.clearTimeout(hideTimer);
    hideTimer = undefined;
  }

  function clearResizeTimer() {
    if (!resizeEndTimer) {
      return;
    }

    window.clearTimeout(resizeEndTimer);
    resizeEndTimer = undefined;
  }

  function captureBounds() {
    const rect = windowRef.value?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    savedBounds.top = rect.top;
    savedBounds.left = rect.left;
    savedBounds.width = rect.width;
    savedBounds.height = rect.height;
  }

  function clampToViewport() {
    const maxWidth = Math.max(minWidth, window.innerWidth - viewportPadding * 2);
    const maxHeight = Math.max(minHeight, window.innerHeight - minTop - viewportPadding);
    const clampedWidth = clamp(bounds.width, minWidth, maxWidth);
    const clampedHeight = clamp(bounds.height, minHeight, maxHeight);
    const maxLeft = window.innerWidth - Math.min(clampedWidth, window.innerWidth) - viewportPadding;
    const maxTop = window.innerHeight - Math.min(clampedHeight, window.innerHeight) - viewportPadding;

    bounds.width = clampedWidth;
    bounds.height = clampedHeight;
    bounds.left = clamp(bounds.left, viewportPadding, maxLeft);
    bounds.top = clamp(bounds.top, minTop, maxTop);
  }

  function canSyncElementSize() {
    if (isMaximized.value || !visible.value || !windowRef.value) {
      return false;
    }

    return window.getComputedStyle(windowRef.value).resize !== "none";
  }

  function syncElementSize() {
    if (!canSyncElementSize()) {
      return;
    }

    const rect = windowRef.value?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const maxWidth = Math.max(minWidth, window.innerWidth - viewportPadding * 2);
    const maxHeight = Math.max(minHeight, window.innerHeight - minTop - viewportPadding);
    const width = Math.round(clamp(rect.width, minWidth, maxWidth));
    const height = Math.round(clamp(rect.height, minHeight, maxHeight));
    const widthChanged = Math.abs(width - bounds.width) > 1;
    const heightChanged = Math.abs(height - bounds.height) > 1;

    if (!widthChanged && !heightChanged) {
      return;
    }

    isResizing.value = true;
    bounds.width = width;
    bounds.height = height;
    clampToViewport();
    clearResizeTimer();
    resizeEndTimer = window.setTimeout(() => {
      isResizing.value = false;
    }, 160);
  }

  function scheduleSizeSync() {
    if (resizeFrame !== undefined) {
      return;
    }

    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = undefined;
      syncElementSize();
    });
  }

  function toggleMaximize() {
    clearHideTimer();

    if (!isMaximized.value) {
      captureBounds();
      isMaximized.value = true;
      return;
    }

    Object.assign(bounds, savedBounds);
    isMaximized.value = false;
    nextTick(clampToViewport);
  }

  function hideWithAnimation(state: WindowAnimation) {
    clearHideTimer();
    animationState.value = state;
    hideTimer = window.setTimeout(() => {
      visible.value = false;
      animationState.value = "";
    }, animationDuration);
  }

  function minimize() {
    hideWithAnimation("minimizing");
  }

  function close() {
    hideWithAnimation("closing");
  }

  function restore(focus?: () => void) {
    clearHideTimer();
    animationState.value = "";
    visible.value = true;
    nextTick(() => {
      if (!isMaximized.value) {
        clampToViewport();
      }

      focus?.();
    });
  }

  function startDragging(event: PointerEvent) {
    if (isMaximized.value || event.button !== 0) {
      return;
    }

    syncElementSize();

    const rect = windowRef.value?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    event.preventDefault();
    dragWidth = rect.width;
    dragHeight = rect.height;
    pendingLeft = bounds.left;
    pendingTop = bounds.top;
    dragState.active = true;
    isDragging.value = true;
    dragState.pointerId = event.pointerId;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    windowRef.value?.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", handleDragging);
    window.addEventListener("pointerup", stopDragging);
  }

  function scheduleDrag(left: number, top: number) {
    pendingLeft = left;
    pendingTop = top;

    if (dragFrame !== undefined) {
      return;
    }

    dragFrame = window.requestAnimationFrame(() => {
      bounds.left = pendingLeft;
      bounds.top = pendingTop;
      dragFrame = undefined;
    });
  }

  function handleDragging(event: PointerEvent) {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    scheduleDrag(
      clamp(
        event.clientX - dragState.offsetX,
        viewportPadding,
        window.innerWidth - Math.min(dragWidth, window.innerWidth) - viewportPadding
      ),
      clamp(
        event.clientY - dragState.offsetY,
        minTop,
        window.innerHeight - Math.min(dragHeight, window.innerHeight) - viewportPadding
      )
    );
  }

  function stopDragging() {
    if (dragFrame !== undefined) {
      window.cancelAnimationFrame(dragFrame);
      dragFrame = undefined;
      bounds.left = pendingLeft;
      bounds.top = pendingTop;
    }

    if (dragState.active) {
      try {
        windowRef.value?.releasePointerCapture(dragState.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    dragState.active = false;
    isDragging.value = false;
    window.removeEventListener("pointermove", handleDragging);
    window.removeEventListener("pointerup", stopDragging);
  }

  function scheduleManualResize(width: number, height: number) {
    pendingWidth = width;
    pendingHeight = height;

    if (manualResizeFrame !== undefined) {
      return;
    }

    manualResizeFrame = window.requestAnimationFrame(() => {
      bounds.width = pendingWidth;
      bounds.height = pendingHeight;
      manualResizeFrame = undefined;
    });
  }

  function startResizing(event: PointerEvent) {
    if (isMaximized.value || event.button !== 0) {
      return;
    }

    event.preventDefault();
    clearResizeTimer();
    isResizing.value = true;
    resizeState.active = true;
    resizeState.pointerId = event.pointerId;
    resizeState.startX = event.clientX;
    resizeState.startY = event.clientY;
    resizeState.startWidth = bounds.width;
    resizeState.startHeight = bounds.height;
    pendingWidth = bounds.width;
    pendingHeight = bounds.height;
    windowRef.value?.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", handleManualResize);
    window.addEventListener("pointerup", stopResizing);
  }

  function handleManualResize(event: PointerEvent) {
    if (!resizeState.active || event.pointerId !== resizeState.pointerId) {
      return;
    }

    const maxWidth = Math.max(minWidth, window.innerWidth - bounds.left - viewportPadding);
    const maxHeight = Math.max(minHeight, window.innerHeight - bounds.top - viewportPadding);

    scheduleManualResize(
      clamp(resizeState.startWidth + event.clientX - resizeState.startX, minWidth, maxWidth),
      clamp(resizeState.startHeight + event.clientY - resizeState.startY, minHeight, maxHeight)
    );
  }

  function stopResizing() {
    if (manualResizeFrame !== undefined) {
      window.cancelAnimationFrame(manualResizeFrame);
      manualResizeFrame = undefined;
      bounds.width = pendingWidth;
      bounds.height = pendingHeight;
    }

    if (resizeState.active) {
      try {
        windowRef.value?.releasePointerCapture(resizeState.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    resizeState.active = false;
    isResizing.value = false;
    window.removeEventListener("pointermove", handleManualResize);
    window.removeEventListener("pointerup", stopResizing);
  }

  function handleResize() {
    if (canSyncElementSize()) {
      clampToViewport();
    }
  }

  onMounted(() => {
    nextTick(() => {
      clampToViewport();

      if ("ResizeObserver" in window && windowRef.value) {
        resizeObserver = new ResizeObserver(scheduleSizeSync);
        resizeObserver.observe(windowRef.value);
      }
    });

    window.addEventListener("resize", handleResize);
  });

  onBeforeUnmount(() => {
    clearHideTimer();
    clearResizeTimer();

    if (resizeFrame !== undefined) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeObserver?.disconnect();
    stopDragging();
    stopResizing();
    window.removeEventListener("resize", handleResize);
  });

  return {
    windowRef,
    visible,
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
