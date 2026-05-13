<template>
  <section
    v-show="visible"
    ref="windowRef"
    class="poko-window absolute flex min-h-[240px] min-w-[320px] flex-col overflow-hidden rounded-[22px] border shadow-[0_28px_100px_rgba(0,0,0,0.42)]"
    :class="{
      active,
      maximized: isMaximized,
      dragging: isDragging,
      resizing: isResizing,
      minimizing: animationState === 'minimizing',
      closing: animationState === 'closing',
      maximizing: animationState === 'maximizing',
      restoring: animationState === 'restoring'
    }"
    :style="windowStyle"
    @pointerdown="focusWindow"
  >
    <header
      class="window-titlebar flex h-11 touch-none cursor-move items-center justify-between gap-4 border-b px-4"
      @pointerdown="startDragging"
      @dblclick="toggleMaximize"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex gap-2">
          <button class="traffic traffic-close" type="button" aria-label="Close window" title="Close" @pointerdown.stop @dblclick.stop @click.stop="closeWindow" />
          <button class="traffic traffic-minimize" type="button" aria-label="Minimize window" title="Minimize" @pointerdown.stop @dblclick.stop @click.stop="minimizeWindow" />
          <button
            class="traffic traffic-maximize"
            :class="{ 'traffic-pulse': maximizePulse }"
            type="button"
            aria-label="Maximize window"
            title="Maximize"
            @pointerdown.stop
            @dblclick.stop
            @click.stop="handleMaximizeRequest"
          />
        </div>
        <div class="flex min-w-0 items-center gap-2">
          <span class="app-icon">{{ icon }}</span>
          <div class="min-w-0">
            <h2 class="truncate text-sm font-semibold">{{ title }}</h2>
            <p v-if="subtitle" class="truncate text-[0.68rem] text-current/55">{{ subtitle }}</p>
          </div>
        </div>
      </div>

      <slot name="actions" />
    </header>

    <div class="window-content min-h-0 flex-1 overflow-hidden">
      <slot />
    </div>

    <button class="resize-handle" type="button" aria-label="Resize window" title="Resize" @pointerdown.stop="startResizing" />
  </section>
</template>

<script setup lang="ts">
type WindowBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const props = defineProps<{
  modelValue: boolean;
  title: string;
  subtitle?: string;
  icon: string;
  zIndex: number;
  active?: boolean;
  initialBounds?: Partial<WindowBounds>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  focus: [];
}>();

const {
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
} = useDraggableWindow({
  initialBounds: props.initialBounds,
  maximizedTop: 58,
  minTop: 72,
  viewportPadding: 14
});
const minimized = ref(false);
const maximizePulse = ref(false);
let maximizePulseTimer: ReturnType<typeof window.setTimeout> | undefined;

const windowStyle = computed(() => ({
  ...style.value,
  zIndex: props.zIndex
}));

watch(() => props.modelValue, (value) => {
  if (value) {
    restoreWindow();
  } else {
    minimized.value = false;
    visible.value = false;
  }
});

watch(visible, (value) => {
  if (value) {
    emit("update:modelValue", true);
    return;
  }

  if (!minimized.value) {
    emit("update:modelValue", false);
  }
});

function minimizeWindow() {
  minimized.value = true;
  minimize();
}

function closeWindow() {
  minimized.value = false;
  close();
}

function handleMaximizeRequest() {
  triggerMaximizePulse();
  toggleMaximize();
}

function triggerMaximizePulse() {
  if (maximizePulseTimer) {
    window.clearTimeout(maximizePulseTimer);
  }

  maximizePulse.value = false;
  window.requestAnimationFrame(() => {
    maximizePulse.value = true;
  });

  maximizePulseTimer = window.setTimeout(() => {
    maximizePulse.value = false;
    maximizePulseTimer = undefined;
  }, 420);
}

function restoreWindow() {
  minimized.value = false;
  restore();
}

function focusWindow() {
  syncElementSize();
  emit("focus");
}

defineExpose({
  restore: restoreWindow
});

onBeforeUnmount(() => {
  if (maximizePulseTimer) {
    window.clearTimeout(maximizePulseTimer);
  }
});
</script>

<style scoped>
.poko-window {
  color: var(--os-text);
  border-color: var(--glass-border);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.08)),
    var(--glass-surface);
  backdrop-filter: blur(28px) saturate(1.35);
  animation: openWindow 260ms cubic-bezier(0.2, 0.82, 0.2, 1) both;
  resize: none;
  transform-origin: top center;
  transition:
    border-radius 220ms ease,
    box-shadow 220ms ease,
    transform 220ms ease;
}

.poko-window::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.32), transparent 28rem),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 42%);
  opacity: 0.72;
}

.poko-window > * {
  position: relative;
}

.poko-window.active {
  box-shadow:
    0 30px 120px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--accent-soft);
}

.poko-window.maximized {
  border-radius: 0 0 22px 22px;
  resize: none;
}

.poko-window.maximizing,
.poko-window.restoring {
  transition:
    top 340ms cubic-bezier(0.16, 1, 0.3, 1),
    left 340ms cubic-bezier(0.16, 1, 0.3, 1),
    width 340ms cubic-bezier(0.16, 1, 0.3, 1),
    height 340ms cubic-bezier(0.16, 1, 0.3, 1),
    border-radius 280ms ease,
    box-shadow 280ms ease,
    transform 280ms ease;
  will-change: top, left, width, height;
}

.poko-window.dragging,
.poko-window.resizing {
  transition: none;
  user-select: none;
}

.poko-window.dragging {
  will-change: left, top;
}

.poko-window.resizing {
  will-change: width, height;
}

.poko-window.maximized .resize-handle {
  display: none;
}

.poko-window.dragging .window-titlebar {
  cursor: grabbing;
}

.poko-window.minimizing {
  animation: minimizeWindow 260ms ease forwards;
}

.poko-window.closing {
  animation: closeWindow 220ms ease forwards;
}

.window-titlebar {
  border-color: var(--glass-border);
  background: rgba(255, 255, 255, 0.08);
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 4;
  width: 1.35rem;
  height: 1.35rem;
  border: 0;
  padding: 0;
  cursor: nwse-resize;
  touch-action: none;
  background:
    linear-gradient(135deg, transparent 0 52%, rgba(255, 255, 255, 0.18) 52% 60%, transparent 60% 68%, rgba(255, 255, 255, 0.32) 68% 76%, transparent 76%);
}

.resize-handle:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: -3px;
}

.traffic {
  position: relative;
  width: 0.78rem;
  height: 0.78rem;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
  transition: transform 160ms ease, filter 160ms ease;
}

.traffic:hover,
.traffic:focus-visible {
  filter: brightness(1.12);
  outline: none;
  transform: scale(1.16);
}

.traffic-close {
  background: #ff5f57;
}

.traffic-minimize {
  background: #ffbd2e;
}

.traffic-maximize {
  background: #28c840;
}

.traffic-maximize::after {
  position: absolute;
  inset: -0.45rem;
  border: 1px solid rgba(76, 255, 141, 0.58);
  border-radius: inherit;
  content: "";
  opacity: 0;
  transform: scale(0.7);
}

.traffic-maximize.traffic-pulse::after {
  animation: maximizePulse 420ms ease forwards;
}

.app-icon {
  display: inline-flex;
  width: 1.7rem;
  height: 1.7rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 800;
}

@keyframes minimizeWindow {
  to {
    opacity: 0;
    transform: translateY(-1.5rem) scale(0.82);
  }
}

@keyframes closeWindow {
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}

@keyframes openWindow {
  from {
    opacity: 0;
    transform: translateY(-0.8rem) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes maximizePulse {
  45% {
    opacity: 0.8;
  }

  to {
    opacity: 0;
    transform: scale(1.45);
  }
}

@media (max-width: 1100px) {
  .poko-window:not(.maximized) {
    left: 0.75rem !important;
    top: 4.75rem !important;
    width: calc(100vw - 1.5rem) !important;
    height: calc(100dvh - 5.5rem) !important;
    min-width: 0;
    min-height: 0;
    border-radius: 18px;
  }

  .resize-handle {
    display: none;
  }
}

@media (max-width: 520px) {
  .poko-window:not(.maximized) {
    left: 0.5rem !important;
    top: 4.25rem !important;
    width: calc(100vw - 1rem) !important;
    height: calc(100dvh - 4.75rem) !important;
    border-radius: 16px;
  }

  .window-titlebar {
    height: 2.75rem;
    gap: 0.5rem;
    padding-inline: 0.75rem;
  }

  .traffic {
    width: 0.7rem;
    height: 0.7rem;
  }

  .app-icon {
    width: 1.45rem;
    height: 1.45rem;
    border-radius: 0.62rem;
    font-size: 0.66rem;
  }
}
</style>
